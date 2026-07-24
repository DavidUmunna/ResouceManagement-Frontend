import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import LeavePage from '../src/pages/Leave';

jest.mock('../src/services/leaveService', () => ({
  getMyBalance:       jest.fn(),
  getLeaveRequests:   jest.fn(),
  createLeaveRequest: jest.fn(),
  cancelLeaveRequest: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

import {
  getMyBalance,
  getLeaveRequests,
  createLeaveRequest,
  cancelLeaveRequest,
} from '../src/services/leaveService';
import { toast } from 'react-toastify';

const MOCK_BALANCE = {
  summary: {
    Annual:    { entitlement: 21, taken: 5, balance: 16 },
    Sick:      { entitlement: 10, taken: 0, balance: 10 },
    Maternity: { entitlement: 90, taken: 0, balance: 90 },
    Paternity: { entitlement: 5,  taken: 0, balance: 5  },
    Emergency: { entitlement: 3,  taken: 0, balance: 3  },
    Unpaid:    { entitlement: 0,  taken: 0, balance: 0  },
  },
};

const MOCK_REQUESTS = [
  {
    _id: 'r1',
    leaveType: 'Annual',
    startDate: '2026-07-01T00:00:00.000Z',
    endDate:   '2026-07-05T00:00:00.000Z',
    daysRequested: 5,
    status: 'Pending',
    adminComment: '',
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  getMyBalance.mockResolvedValue({ data: MOCK_BALANCE });
  getLeaveRequests.mockResolvedValue({ data: MOCK_REQUESTS });
  createLeaveRequest.mockResolvedValue({ data: { _id: 'new-1' } });
  cancelLeaveRequest.mockResolvedValue({ data: {} });
});

afterEach(cleanup);

describe('LeavePage', () => {
  it('renders the page heading', () => {
    render(<LeavePage />);
    expect(screen.getByText(/leave management/i)).toBeInTheDocument();
  });

  it('calls getMyBalance on mount', async () => {
    render(<LeavePage />);
    await waitFor(() => expect(getMyBalance).toHaveBeenCalledTimes(1));
  });

  it('renders balance cards after data loads', async () => {
    render(<LeavePage />);
    await waitFor(() => expect(screen.getByText('Annual')).toBeInTheDocument());
    expect(screen.getByText('16')).toBeInTheDocument();
  });

  it('renders all three tabs', () => {
    render(<LeavePage />);
    expect(screen.getByRole('button', { name: /my balance/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /request leave/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /my requests/i })).toBeInTheDocument();
  });

  it('shows the request form when "Request Leave" tab is clicked', async () => {
    render(<LeavePage />);
    fireEvent.click(screen.getByRole('button', { name: /request leave/i }));
    expect(screen.getByText(/new leave request/i)).toBeInTheDocument();
  });

  it('loads requests when "My Requests" tab is clicked', async () => {
    render(<LeavePage />);
    fireEvent.click(screen.getByRole('button', { name: /my requests/i }));
    await waitFor(() => expect(getLeaveRequests).toHaveBeenCalledTimes(1));
  });

  it('shows request rows after switching to My Requests tab', async () => {
    render(<LeavePage />);
    fireEvent.click(screen.getByRole('button', { name: /my requests/i }));
    // Wait for the status badge which is unique to the table (not in balance cards)
    await waitFor(() => expect(screen.getByText('Pending')).toBeInTheDocument());
  });

  it('shows error toast when getMyBalance fails', async () => {
    getMyBalance.mockRejectedValue(new Error('Network error'));
    render(<LeavePage />);
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Failed to load leave balance')
    );
  });

  it('submits request, shows toast, and reloads balance', async () => {
    render(<LeavePage />);
    fireEvent.click(screen.getByRole('button', { name: /request leave/i }));

    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2026-09-01' } });
    fireEvent.change(screen.getByLabelText(/end date/i),   { target: { value: '2026-09-05' } });
    fireEvent.change(screen.getByLabelText(/reason/i),     { target: { value: 'Summer family vacation time' } });
    fireEvent.submit(document.querySelector('form'));

    await waitFor(() => expect(createLeaveRequest).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Leave request submitted successfully')
    );
    // Balance reloads after submit (called twice total)
    await waitFor(() => expect(getMyBalance).toHaveBeenCalledTimes(2));
  });

  it('shows error toast when submit fails', async () => {
    createLeaveRequest.mockRejectedValue({
      response: { data: { message: 'Insufficient balance' } },
    });
    render(<LeavePage />);
    fireEvent.click(screen.getByRole('button', { name: /request leave/i }));

    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2026-09-01' } });
    fireEvent.change(screen.getByLabelText(/end date/i),   { target: { value: '2026-09-05' } });
    fireEvent.change(screen.getByLabelText(/reason/i),     { target: { value: 'Family vacation trip booked' } });
    fireEvent.submit(document.querySelector('form'));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Insufficient balance')
    );
  });

  it('calls cancelLeaveRequest and shows success toast', async () => {
    render(<LeavePage />);
    fireEvent.click(screen.getByRole('button', { name: /my requests/i }));
    await waitFor(() => screen.getByRole('button', { name: /cancel/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    await waitFor(() => expect(cancelLeaveRequest).toHaveBeenCalledWith('r1'));
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Request cancelled')
    );
  });
});
