import axios from 'axios';
import {
  createLeaveRequest,
  getLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  cancelLeaveRequest,
  getMyBalance,
  getUserBalance,
  updateEntitlement,
} from '../src/services/leaveService';

jest.mock('@sentry/react', () => ({
  captureMessage: jest.fn(),
  captureException: jest.fn(),
}));

jest.mock('../src/components/env', () => ({ isProd: false }));

const BASE = `${process.env.REACT_APP_API_URL}/api/v2/leave`;

const MOCK_REQUEST = {
  _id: 'req-1',
  leaveType: 'Annual',
  startDate: '2026-07-01',
  endDate: '2026-07-05',
  daysRequested: 5,
  reason: 'Summer holiday',
  status: 'Pending',
};

const MOCK_BALANCE = {
  user: 'user-1',
  year: 2026,
  summary: {
    Annual: { entitlement: 21, taken: 5, balance: 16 },
    Sick:   { entitlement: 10, taken: 0, balance: 10 },
  },
};

beforeEach(() => jest.clearAllMocks());

describe('leaveService', () => {
  describe('createLeaveRequest', () => {
    it('posts to /requests and returns response data', async () => {
      axios.post.mockResolvedValue({ data: { success: true, data: MOCK_REQUEST } });

      const result = await createLeaveRequest({
        leaveType: 'Annual',
        startDate: '2026-07-01',
        endDate: '2026-07-05',
        reason: 'Summer holiday',
      });

      expect(axios.post).toHaveBeenCalledWith(
        `${BASE}/requests`,
        expect.objectContaining({ leaveType: 'Annual' }),
        expect.objectContaining({ withCredentials: true })
      );
      expect(result).toEqual({ success: true, data: MOCK_REQUEST });
    });

    it('throws on network error', async () => {
      axios.post.mockRejectedValue(new Error('Network error'));
      await expect(createLeaveRequest({})).rejects.toThrow('Network error');
    });
  });

  describe('getLeaveRequests', () => {
    it('calls GET /requests and returns data', async () => {
      axios.get.mockResolvedValue({ data: { success: true, data: [MOCK_REQUEST] } });
      const result = await getLeaveRequests();
      expect(axios.get).toHaveBeenCalledWith(
        `${BASE}/requests`,
        expect.objectContaining({ withCredentials: true })
      );
      expect(result.data).toHaveLength(1);
    });

    it('throws on error', async () => {
      axios.get.mockRejectedValue(new Error('Server error'));
      await expect(getLeaveRequests()).rejects.toThrow('Server error');
    });
  });

  describe('approveLeaveRequest', () => {
    it('puts to /requests/:id/approve with comment', async () => {
      axios.put.mockResolvedValue({ data: { success: true, data: { ...MOCK_REQUEST, status: 'Approved' } } });
      const result = await approveLeaveRequest('req-1', 'Looks good');
      expect(axios.put).toHaveBeenCalledWith(
        `${BASE}/requests/req-1/approve`,
        { adminComment: 'Looks good' },
        expect.objectContaining({ withCredentials: true })
      );
      expect(result.data.status).toBe('Approved');
    });

    it('defaults adminComment to empty string when omitted', async () => {
      axios.put.mockResolvedValue({ data: {} });
      await approveLeaveRequest('req-1');
      expect(axios.put).toHaveBeenCalledWith(
        expect.any(String),
        { adminComment: '' },
        expect.any(Object)
      );
    });
  });

  describe('rejectLeaveRequest', () => {
    it('puts to /requests/:id/reject with comment', async () => {
      axios.put.mockResolvedValue({ data: { success: true, data: { ...MOCK_REQUEST, status: 'Rejected' } } });
      const result = await rejectLeaveRequest('req-1', 'Not approved this period');
      expect(axios.put).toHaveBeenCalledWith(
        `${BASE}/requests/req-1/reject`,
        { adminComment: 'Not approved this period' },
        expect.objectContaining({ withCredentials: true })
      );
      expect(result.data.status).toBe('Rejected');
    });
  });

  describe('cancelLeaveRequest', () => {
    it('calls DELETE /requests/:id', async () => {
      axios.delete.mockResolvedValue({ data: { success: true, data: { ...MOCK_REQUEST, status: 'Cancelled' } } });
      const result = await cancelLeaveRequest('req-1');
      expect(axios.delete).toHaveBeenCalledWith(
        `${BASE}/requests/req-1`,
        expect.objectContaining({ withCredentials: true })
      );
      expect(result.data.status).toBe('Cancelled');
    });

    it('throws on error', async () => {
      axios.delete.mockRejectedValue(new Error('Forbidden'));
      await expect(cancelLeaveRequest('req-1')).rejects.toThrow('Forbidden');
    });
  });

  describe('getMyBalance', () => {
    it('calls GET /balance and returns data', async () => {
      axios.get.mockResolvedValue({ data: { success: true, data: MOCK_BALANCE } });
      const result = await getMyBalance();
      expect(axios.get).toHaveBeenCalledWith(
        `${BASE}/balance`,
        expect.objectContaining({ withCredentials: true })
      );
      expect(result.data).toEqual(MOCK_BALANCE);
    });

    it('throws on error', async () => {
      axios.get.mockRejectedValue(new Error('Unauthorized'));
      await expect(getMyBalance()).rejects.toThrow('Unauthorized');
    });
  });

  describe('getUserBalance', () => {
    it('calls GET /balance/:userId', async () => {
      axios.get.mockResolvedValue({ data: { success: true, data: MOCK_BALANCE } });
      await getUserBalance('user-1');
      expect(axios.get).toHaveBeenCalledWith(
        `${BASE}/balance/user-1`,
        expect.objectContaining({ withCredentials: true })
      );
    });
  });

  describe('updateEntitlement', () => {
    it('puts to /balance/:userId with leaveType and entitlement', async () => {
      const updated = { ...MOCK_BALANCE, Annual: { entitlement: 25, taken: 5 } };
      axios.put.mockResolvedValue({ data: { success: true, data: updated } });
      const result = await updateEntitlement('user-1', 'Annual', 25);
      expect(axios.put).toHaveBeenCalledWith(
        `${BASE}/balance/user-1`,
        { leaveType: 'Annual', entitlement: 25 },
        expect.objectContaining({ withCredentials: true })
      );
      expect(result.data.Annual.entitlement).toBe(25);
    });

    it('throws on forbidden error', async () => {
      axios.put.mockRejectedValue(new Error('FORBIDDEN'));
      await expect(updateEntitlement('user-1', 'Annual', 25)).rejects.toThrow('FORBIDDEN');
    });
  });
});
