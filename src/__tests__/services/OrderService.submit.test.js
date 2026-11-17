import axios from "axios";
import { submitPurchaseOrder, newIdempotencyKey } from "../../services/OrderService";

jest.mock("@sentry/react", () => ({ captureMessage: jest.fn(), captureException: jest.fn() }));
jest.mock("../../components/env", () => ({ isProd: false }));

const ORDER = { supplier: "Acme", Title: "Toner", products: [{ name: "Toner", quantity: 1, price: 100 }], remarks: "x" };
const KEY = "attempt-key-1";

const httpError = (status, data) => Object.assign(new Error(`HTTP ${status}`), { response: { status, data } });
const urlOf = (call) => call[0];
const keyOf = (call) => call[2]?.headers?.["Idempotency-Key"];

describe("newIdempotencyKey", () => {
  it("returns distinct keys in the format the server accepts", () => {
    const a = newIdempotencyKey();
    const b = newIdempotencyKey();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]{1,100}$/);
  });
});

describe("submitPurchaseOrder", () => {
  beforeEach(() => {
    axios.post.mockReset();
  });

  it("prechecks, then uploads, then creates — all with the same Idempotency-Key", async () => {
    axios.post
      .mockResolvedValueOnce({ status: 200, data: { ok: true } })                          // precheck
      .mockResolvedValueOnce({ status: 200, data: { files: { _id: "file-1" } } })         // upload
      .mockResolvedValueOnce({ status: 201, data: { success: true, newOrder: { _id: "o1", orderNumber: "PO-1" } } });
    const stages = [];

    const res = await submitPurchaseOrder({
      orderData: ORDER, files: [new Blob(["x"])], idempotencyKey: KEY, onStage: (s) => stages.push(s),
    });

    expect(res).toEqual({ status: "created", order: { _id: "o1", orderNumber: "PO-1" }, replayed: false });
    expect(stages).toEqual(["checking", "uploading", "creating"]);
    const [pre, upload, create] = axios.post.mock.calls;
    expect(urlOf(pre)).toMatch(/\/api\/orders\/precheck$/);
    expect(urlOf(upload)).toMatch(/\/api\/fileupload\/create$/);
    expect(urlOf(create)).toMatch(/\/api\/orders$/);
    expect(keyOf(pre)).toBe(KEY);
    expect(keyOf(create)).toBe(KEY);
    expect(create[1]).toMatchObject({ ...ORDER, fileRefs: "file-1" });
    expect(create[1].confirmDuplicate).toBeUndefined();
  });

  it("skips the upload when there are no attachments", async () => {
    axios.post
      .mockResolvedValueOnce({ status: 200, data: { ok: true } })
      .mockResolvedValueOnce({ status: 201, data: { success: true, newOrder: { _id: "o1" } } });

    await submitPurchaseOrder({ orderData: ORDER, idempotencyKey: KEY });

    expect(axios.post).toHaveBeenCalledTimes(2);
    expect(axios.post.mock.calls.some((c) => /fileupload/.test(urlOf(c)))).toBe(false);
  });

  it("a duplicate at precheck returns the 409 details and uploads nothing", async () => {
    const existingOrder = { id: "o0", orderNumber: "PO-0", createdAt: "2026-11-16T08:48:35.947Z" };
    axios.post.mockRejectedValueOnce(httpError(409, { code: "POSSIBLE_DUPLICATE", existingOrder, inProgress: false }));

    const res = await submitPurchaseOrder({ orderData: ORDER, files: [new Blob(["x"])], idempotencyKey: KEY });

    expect(res).toMatchObject({ status: "duplicate", existingOrder, inProgress: false });
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it("a precheck replay (this attempt already created its order) is a success with no upload", async () => {
    axios.post.mockResolvedValueOnce({ status: 200, data: { ok: true, replayed: true, newOrder: { _id: "o1", orderNumber: "PO-1" } } });

    const res = await submitPurchaseOrder({ orderData: ORDER, files: [new Blob(["x"])], idempotencyKey: KEY });

    expect(res).toEqual({ status: "created", order: { _id: "o1", orderNumber: "PO-1" }, replayed: true });
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it("a 200 replay on create is reported as a success", async () => {
    axios.post
      .mockResolvedValueOnce({ status: 200, data: { ok: true } })
      .mockResolvedValueOnce({ status: 200, data: { success: true, replayed: true, newOrder: { _id: "o1" } } });

    const res = await submitPurchaseOrder({ orderData: ORDER, idempotencyKey: KEY });
    expect(res).toMatchObject({ status: "created", replayed: true });
  });

  it("confirmDuplicate is sent on both precheck and create", async () => {
    axios.post
      .mockResolvedValueOnce({ status: 200, data: { ok: true } })
      .mockResolvedValueOnce({ status: 201, data: { success: true, newOrder: { _id: "o2" } } });

    await submitPurchaseOrder({ orderData: ORDER, idempotencyKey: KEY, confirmDuplicate: true });

    expect(axios.post.mock.calls[0][1].confirmDuplicate).toBe(true);
    expect(axios.post.mock.calls[1][1].confirmDuplicate).toBe(true);
  });

  it("422 IDEMPOTENCY_KEY_REUSED is reported so the caller can retry with a new key", async () => {
    axios.post.mockRejectedValueOnce(httpError(422, { code: "IDEMPOTENCY_KEY_REUSED" }));
    const res = await submitPurchaseOrder({ orderData: ORDER, idempotencyKey: KEY });
    expect(res).toEqual({ status: "key_reused" });
  });

  it("a 409 on create (e.g. the window lapsed mid-upload) is reported as a duplicate", async () => {
    axios.post
      .mockResolvedValueOnce({ status: 200, data: { ok: true } })
      .mockRejectedValueOnce(httpError(409, { code: "POSSIBLE_DUPLICATE", existingOrder: null, inProgress: true }));

    const res = await submitPurchaseOrder({ orderData: ORDER, idempotencyKey: KEY });
    expect(res).toMatchObject({ status: "duplicate", inProgress: true });
  });

  it("falls back to upload + create when the backend has no precheck endpoint (404)", async () => {
    axios.post
      .mockRejectedValueOnce(httpError(404, {}))
      .mockResolvedValueOnce({ status: 201, data: { success: true, newOrder: { _id: "o1" } } });

    const res = await submitPurchaseOrder({ orderData: ORDER, idempotencyKey: KEY });
    expect(res.status).toBe("created");
    expect(keyOf(axios.post.mock.calls[1])).toBe(KEY);
  });

  it("releases the reservation and rethrows when the upload fails", async () => {
    const netErr = new Error("Network Error");
    axios.post
      .mockResolvedValueOnce({ status: 200, data: { ok: true } })   // precheck
      .mockRejectedValueOnce(netErr)                                // upload
      .mockResolvedValueOnce({ status: 200, data: { released: 1 } }); // release

    await expect(
      submitPurchaseOrder({ orderData: ORDER, files: [new Blob(["x"])], idempotencyKey: KEY })
    ).rejects.toBe(netErr);

    const release = axios.post.mock.calls[2];
    expect(urlOf(release)).toMatch(/\/api\/orders\/precheck\/release$/);
    expect(keyOf(release)).toBe(KEY);
  });

  it("rethrows auth errors from precheck without uploading", async () => {
    axios.post.mockRejectedValueOnce(httpError(401, {}));
    await expect(submitPurchaseOrder({ orderData: ORDER, files: [new Blob(["x"])], idempotencyKey: KEY })).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(axios.post).toHaveBeenCalledTimes(1);
  });
});
