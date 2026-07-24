import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor, within } from '@testing-library/react';
import LeaveSummaryPage from '../src/pages/Leave/LeaveSummaryPage';

jest.mock('../src/services/leaveService', () => ({
  getLeaveRequests: jest.fn(),
  getUserBalance:   jest.fn(),
}));

jest.mock('../src/components/usercontext', () => ({
  useUser: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

import { getLeaveRequests, getUserBalance } from '../src/services/leaveService';
import { useUser } from '../src/components/usercontext';
import { toast } from 'react-toastify';
import axios from 'axios';

const DIRECTOR   = { role: 'Director',     name: 'Jane Director' };
const GADMIN     = { role: 'global_admin', name: 'Global Admin'  };
const STAFF      = { role: 'staff',        name: 'Staff User'    };

const MOCK_USERS = [
  { _id: 'u1', name: 'Alice Johnson', role: 'human_resources' },
  { _id: 'u2', name: 'Bob Smith',     role: 'procurement_officer' },
];

const MOCK_REQUESTS = [
  {
    _id: 'r1', leaveType: 'Annual', daysRequested: 5, status: 'Pending',
    startDate: '2026-07-01T00:00:00.000Z', endDate: '2026-07-05T00:00:00.000Z',
    user: { _id: 'u1', name: 'Alice Johnson' },
  },
  {
    _id: 'r2', leaveType: 'Sick', daysRequested: 2, status: 'Approved',
    startDate: '2026-06-10T00:00:00.000Z', endDate: '2026-06-11T00:00:00.000Z',
    user: { _id: 'u2', name: 'Bob Smith' },
  },
];

const MOCK_BALANCE = {
  summary: {
    Annual:    { entitlement: 21, taken: 5,  balance: 16 },
    Sick:      { entitlement: 10, taken: 2,  balance: 8  },
    Maternity: { entitlement: 90, taken: 0,  balance: 90 },
    Paternity: { entitlement: 5,  taken: 0,  balance: 5  },
    Emergency: { entitlement: 3,  taken: 0,  balance: 3  },
    Unpaid:    { entitlement: 0,  taken: 0,  balance: 0  },
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  axios.get.mockResolvedValue({ data: { data: MOCK_USERS } });
  getLeaveRequests.mockResolvedValue({ data: MOCK_REQUESTS });
  getUserBalance.mockResolvedValue({ data: MOCK_BALANCE });
});

afterEach(cleanup);

describe('LeaveSummaryPage', () => {
  it('shows access denied for non-Director / non-global_admin users', () => {
    useUser.mockReturnValue({ user: STAFF });
    render(<LeaveSummaryPage />);
    expect(screen.getByText(/do not have permission/i)).toBeInTheDocument();
  });

  it('renders the page for Director role', async () => {
    useUser.mockReturnValue({ user: DIRECTOR });
    render(<LeaveSummaryPage />);
    expect(screen.getByText(/leave summary/i)).toBeInTheDocument();
  });

  it('renders the page for global_admin role', async () => {
    useUser.mockReturnValue({ user: GADMIN });
    render(<LeaveSummaryPage />);
    expect(screen.getByText(/leave summary/i)).toBeInTheDocument();
  });

  it('fetches users and requests on mount', async () => {
    useUser.mockReturnValue({ user: DIRECTOR });
    render(<LeaveSummaryPage />);
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getLeaveRequests).toHaveBeenCalledTimes(1));
  });

  it('renders stat cards with correct values after loading', async () => {
    useUser.mockReturnValue({ user: DIRECTOR });
    render(<LeaveSummaryPage />);
    // employee-table only renders when loading=false AND users are set (one atomic batch now)
    await waitFor(() => screen.getByTestId('employee-table'));
    expect(screen.getByText(/total employees/i)).toBeInTheDocument();
    expect(screen.getByText(/total requests/i)).toBeInTheDocument();
    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(2); // totalUsers and totalRequests are both 2
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1); // pending stat card + employee table badge
    expect(screen.getByText(/days taken \(approved\)/i)).toBeInTheDocument();
  });

  it('renders a row for each employee', async () => {
    useUser.mockReturnValue({ user: DIRECTOR });
    render(<LeaveSummaryPage />);
    // Names appear in both the employee table and the all-requests section
    await waitFor(() => expect(screen.getAllByText('Alice Johnson').length).toBeGreaterThan(0));
    expect(screen.getAllByText('Bob Smith').length).toBeGreaterThan(0);
    // Roles only appear in the employee table, confirming both rows rendered there
    expect(screen.getByText('human_resources')).toBeInTheDocument();
    expect(screen.getByText('procurement_officer')).toBeInTheDocument();
  });

  it('renders "View Balance" button for each employee', async () => {
    useUser.mockReturnValue({ user: DIRECTOR });
    render(<LeaveSummaryPage />);
    await waitFor(() => screen.getAllByRole('button', { name: /view balance/i }));
    expect(screen.getAllByRole('button', { name: /view balance/i })).toHaveLength(2);
  });

  it('opens the balance modal when "View Balance" is clicked', async () => {
    useUser.mockReturnValue({ user: DIRECTOR });
    render(<LeaveSummaryPage />);
    await waitFor(() => screen.getAllByRole('button', { name: /view balance/i }));
    fireEvent.click(screen.getAllByRole('button', { name: /view balance/i })[0]);
    expect(screen.getByText('Leave Balance')).toBeInTheDocument();
    await waitFor(() => expect(getUserBalance).toHaveBeenCalledWith('u1'));
  });

  it('renders leave type rows inside the balance modal', async () => {
    useUser.mockReturnValue({ user: DIRECTOR });
    render(<LeaveSummaryPage />);
    await waitFor(() => screen.getAllByRole('button', { name: /view balance/i }));
    fireEvent.click(screen.getAllByRole('button', { name: /view balance/i })[0]);
    await waitFor(() => expect(screen.getAllByText('Annual').length).toBeGreaterThan(0));
    expect(screen.getByText('16')).toBeInTheDocument(); // Annual balance
  });

  it('closes the balance modal when Close is clicked', async () => {
    useUser.mockReturnValue({ user: DIRECTOR });
    render(<LeaveSummaryPage />);
    await waitFor(() => screen.getAllByRole('button', { name: /view balance/i }));
    fireEvent.click(screen.getAllByRole('button', { name: /view balance/i })[0]);
    await waitFor(() => screen.getByText('Leave Balance'));
    // × button has aria-label="Dismiss"; text "Close" button is the only /close/i match
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(screen.queryByText('Leave Balance')).not.toBeInTheDocument();
  });

  it('filters the employee table by search input', async () => {
    useUser.mockReturnValue({ user: DIRECTOR });
    render(<LeaveSummaryPage />);
    await waitFor(() => screen.getByTestId('employee-table'));
    fireEvent.change(screen.getByLabelText(/search employees/i), { target: { value: 'Alice' } });
    const empTable = screen.getByTestId('employee-table');
    expect(within(empTable).getByText('Alice Johnson')).toBeInTheDocument();
    expect(within(empTable).queryByText('Bob Smith')).not.toBeInTheDocument();
  });

  it('filters employees to those with pending requests', async () => {
    useUser.mockReturnValue({ user: DIRECTOR });
    render(<LeaveSummaryPage />);
    await waitFor(() => screen.getByTestId('employee-table'));
    fireEvent.change(screen.getByLabelText(/filter by status/i), { target: { value: 'Has Pending' } });
    const empTable = screen.getByTestId('employee-table');
    expect(within(empTable).getByText('Alice Johnson')).toBeInTheDocument();
    expect(within(empTable).queryByText('Bob Smith')).not.toBeInTheDocument();
  });

  it('shows all requests in the requests section', async () => {
    useUser.mockReturnValue({ user: DIRECTOR });
    render(<LeaveSummaryPage />);
    await waitFor(() => screen.getByText('All Requests'));
    // Both requests appear in the all-requests table
    expect(screen.getAllByText('Alice Johnson').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Bob Smith').length).toBeGreaterThan(0);
  });

  it('filters the requests table by leave type', async () => {
    useUser.mockReturnValue({ user: DIRECTOR });
    render(<LeaveSummaryPage />);
    await waitFor(() => screen.getByText('All Requests'));
    // Click "Sick" type filter — only Bob's Approved request remains
    fireEvent.click(screen.getByRole('button', { name: /^sick \(/i }));
    const reqTable = screen.getByTestId('requests-table');
    await waitFor(() => expect(within(reqTable).queryByText('Pending')).not.toBeInTheDocument());
    expect(within(reqTable).getByText('Approved')).toBeInTheDocument();
  });

  it('shows 5 loading skeletons while data is loading', () => {
    useUser.mockReturnValue({ user: DIRECTOR });
    // Make requests hang so loading state persists
    axios.get.mockReturnValue(new Promise(() => {}));
    const { container } = render(<LeaveSummaryPage />);
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(5);
  });

  it('shows error toast when data load fails', async () => {
    useUser.mockReturnValue({ user: DIRECTOR });
    axios.get.mockRejectedValue(new Error('Network error'));
    render(<LeaveSummaryPage />);
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Failed to load leave summary')
    );
  });
});
