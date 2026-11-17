import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import CreateOrder from "../../pages/CreateOrder";
import { submitPurchaseOrder } from "../../services/OrderService";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({ useNavigate: () => mockNavigate }));

let mockKeySeq = 0;
jest.mock("../../services/OrderService", () => ({
  submitPurchaseOrder: jest.fn(),
  newIdempotencyKey: jest.fn(() => `key-${++mockKeySeq}`),
}));
jest.mock("../../services/rbac_service", () => ({ fetch_RBAC_maintenance: jest.fn().mockResolvedValue(null) }));
jest.mock("../../components/usercontext", () => ({
  useUser: () => ({ user: { userId: "u1", email: "u1@test.com", Department: "IT" } }),
}));
jest.mock("../../pages/FollowUpCreatePanel", () => () => <div>follow-up panel</div>);

// framer-motion → plain elements (strip animation props)
jest.mock("framer-motion", () => {
  const React = require("react");
  const strip = ({ variants, initial, animate, exit, transition, whileHover, ...rest }) => rest;
  const motion = new Proxy({}, { get: (_t, tag) => React.forwardRef((p, ref) => React.createElement(tag, { ...strip(p), ref })) });
  return { motion, AnimatePresence: ({ children }) => React.createElement(React.Fragment, null, children) };
});

const deferred = () => {
  let resolve;
  const promise = new Promise((r) => { resolve = r; });
  return { promise, resolve };
};

function fillForm(container, { title = "Printer toner", item = "Toner black" } = {}) {
  const textInputs = container.querySelectorAll('input[type="text"]');
  fireEvent.change(textInputs[0], { target: { value: title } });
  fireEvent.change(screen.getByDisplayValue("Select Urgency"), { target: { value: "Urgent" } });
  fireEvent.change(screen.getByPlaceholderText(/Describe your request/i), { target: { value: "2nd floor printers" } });
  fireEvent.change(screen.getByPlaceholderText("Requested Item"), { target: { value: item } });
  fireEvent.change(screen.getByPlaceholderText("Price"), { target: { value: "25000" } });
}

const submit = () => fireEvent.click(screen.getByRole("button", { name: /create request/i }));
const lastCall = () => submitPurchaseOrder.mock.calls[submitPurchaseOrder.mock.calls.length - 1][0];

beforeEach(() => {
  jest.clearAllMocks();
  mockKeySeq = 0;
});

describe("CreateOrder — duplicate protection", () => {
  it("disables submit and shows stage progress while the request is in flight", async () => {
    const d = deferred();
    submitPurchaseOrder.mockImplementation(({ onStage }) => {
      onStage("uploading");
      return d.promise;
    });
    const { container } = render(<CreateOrder />);
    fillForm(container);
    submit();

    const btn = await screen.findByRole("button", { name: /uploading attachment/i });
    expect(btn).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent(/uploading attachment/i);

    fireEvent.submit(container.querySelector("form")); // a second submit is ignored
    expect(submitPurchaseOrder).toHaveBeenCalledTimes(1);

    await act(async () => d.resolve({ status: "created", order: { orderNumber: "PO-9" }, replayed: false }));
    expect(await screen.findByText(/PO-9 submitted successfully/i)).toBeInTheDocument();
  });

  it("reuses the key when retrying unchanged content, and uses a new key after an edit", async () => {
    submitPurchaseOrder.mockRejectedValueOnce(new Error("Network Error"));
    const { container } = render(<CreateOrder />);
    fillForm(container);
    submit();
    await screen.findByText(/error processing your Request/i);
    const firstKey = lastCall().idempotencyKey;

    submitPurchaseOrder.mockRejectedValueOnce(new Error("Network Error"));
    submit(); // retry, nothing changed
    await waitFor(() => expect(submitPurchaseOrder).toHaveBeenCalledTimes(2));
    expect(lastCall().idempotencyKey).toBe(firstKey);

    fireEvent.change(screen.getByPlaceholderText(/Describe your request/i), { target: { value: "fixed typo" } });
    submitPurchaseOrder.mockResolvedValueOnce({ status: "created", order: {}, replayed: false });
    submit();
    await waitFor(() => expect(submitPurchaseOrder).toHaveBeenCalledTimes(3));
    expect(lastCall().idempotencyKey).not.toBe(firstKey);
  });

  it("generates a new key after a successful create (form reset)", async () => {
    submitPurchaseOrder.mockResolvedValue({ status: "created", order: { orderNumber: "PO-1" }, replayed: false });
    const { container } = render(<CreateOrder />);
    fillForm(container);
    submit();
    await screen.findByText(/PO-1 submitted successfully/i);
    const firstKey = lastCall().idempotencyKey;
    expect(container.querySelectorAll('input[type="text"]')[0]).toHaveValue(""); // form reset

    fillForm(container);
    submit();
    await waitFor(() => expect(submitPurchaseOrder).toHaveBeenCalledTimes(2));
    expect(lastCall().idempotencyKey).not.toBe(firstKey);
  });

  it("treats a 200 replay as a success", async () => {
    submitPurchaseOrder.mockResolvedValue({ status: "created", order: { orderNumber: "PO-7" }, replayed: true });
    const { container } = render(<CreateOrder />);
    fillForm(container);
    submit();
    expect(await screen.findByText(/PO-7 submitted successfully/i)).toBeInTheDocument();
  });

  it("on 409 asks for confirmation; 'Create anyway' resends the same payload and key with confirmDuplicate", async () => {
    submitPurchaseOrder.mockResolvedValueOnce({
      status: "duplicate",
      inProgress: false,
      existingOrder: { id: "o-1", orderNumber: "PO-1794818915942", createdAt: new Date(Date.now() - 2 * 60000).toISOString() },
    });
    const { container } = render(<CreateOrder />);
    fillForm(container);
    submit();

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent(/already submitted an identical purchase order/i);
    expect(dialog).toHaveTextContent("PO-1794818915942");
    expect(dialog).toHaveTextContent(/2 minutes ago/);
    const first = lastCall();

    submitPurchaseOrder.mockResolvedValueOnce({ status: "created", order: { orderNumber: "PO-2" }, replayed: false });
    fireEvent.click(screen.getByRole("button", { name: /create anyway/i }));

    await waitFor(() => expect(submitPurchaseOrder).toHaveBeenCalledTimes(2));
    const second = lastCall();
    expect(second.confirmDuplicate).toBe(true);
    expect(second.idempotencyKey).toBe(first.idempotencyKey);
    expect(second.orderData).toEqual(first.orderData);
    expect(await screen.findByText(/PO-2 submitted successfully/i)).toBeInTheDocument();
  });

  it("'Cancel' on the 409 dialog opens the existing order", async () => {
    submitPurchaseOrder.mockResolvedValueOnce({
      status: "duplicate", inProgress: false, existingOrder: { id: "o-1", orderNumber: "PO-1", createdAt: new Date().toISOString() },
    });
    const { container } = render(<CreateOrder />);
    fillForm(container);
    submit();
    fireEvent.click(await screen.findByRole("button", { name: /cancel/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/admin/requestlist#order-o-1");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(submitPurchaseOrder).toHaveBeenCalledTimes(1);
  });

  it("an in-progress duplicate offers only 'Check my orders' (no override)", async () => {
    submitPurchaseOrder.mockResolvedValueOnce({ status: "duplicate", inProgress: true, existingOrder: null });
    const { container } = render(<CreateOrder />);
    fillForm(container);
    submit();

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent(/being submitted right now/i);
    expect(screen.queryByRole("button", { name: /create anyway/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /check my orders/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/admin/requestlist");
  });

  it("on 422 retries once automatically with a new key", async () => {
    submitPurchaseOrder
      .mockResolvedValueOnce({ status: "key_reused" })
      .mockResolvedValueOnce({ status: "created", order: { orderNumber: "PO-3" }, replayed: false });
    const { container } = render(<CreateOrder />);
    fillForm(container);
    submit();

    // Two chained submissions: allow extra time on slow/cold CI runners.
    expect(await screen.findByText(/PO-3 submitted successfully/i, {}, { timeout: 4000 })).toBeInTheDocument();
    expect(submitPurchaseOrder).toHaveBeenCalledTimes(2);
    const [a, b] = submitPurchaseOrder.mock.calls.map((c) => c[0].idempotencyKey);
    expect(b).not.toBe(a);
  });

  it("does not loop if the retried key is also rejected", async () => {
    submitPurchaseOrder.mockResolvedValue({ status: "key_reused" });
    const { container } = render(<CreateOrder />);
    fillForm(container);
    submit();
    expect(await screen.findByText(/could not be submitted/i, {}, { timeout: 4000 })).toBeInTheDocument();
    expect(submitPurchaseOrder).toHaveBeenCalledTimes(2);
  });
});
