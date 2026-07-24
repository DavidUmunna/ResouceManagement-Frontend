import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor, within } from '@testing-library/react';
import AdminLeavePanel from '../src/pages/Leave/AdminLeavePanel';

jest.mock('../src/services/leaveService', () => ({
  getLeaveRequests:    jest.fn(),
  approveLeaveRequest: jest.fn(),
  rejectLeaveRequest:  jest.fn(),
  cancelLeaveRequest:  jest.fn(),
}));

jest.mock('../src/components/usercontext', () => ({
  useUser: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

// Stub EntitlementEditor so the panel tests don't depend on its internals
jest.mock('../src/pages/Leave/AdminLeavePanel/EntitlementEditor', () => () => (
  <div data-testid="entitlement-editor">EntitlementEditor</div>
));

import { getLeaveRequests, approveLeaveRequest, rejectLeaveRequest, cancelLeaveRequest } from '../src/services/leaveService';
import { useUser } from '../src/components/usercontext';
import { toast } from 'react-toastify';
import axios from 'axios';

const ADMIN_USER  = { role: 'admin',        name: 'Admin User'   };
const GADMIN_USER = { role: 'global_admin', name: 'Global Admin' };
const STAFF_USER  = { role: 'staff',        name: 'Staff User'   };

const REQUESTS = [
  {
    _id: 'r1',
    leaveType: 'Annual',
    startDate: '2026-07-01T00:00:00.000Z',
    endDate:   '2026-07-05T00:00:00.000Z',
    daysRequested: 5,
    reason: 'Summer holiday',
    status: 'Pending',
    adminComment: '',
    createdAt: '2026-06-01T00:00:00.000Z',
    user: { name: 'Alice Johnson' },
  },
  {
    _id: 'r2',
    leaveType: 'Sick',
    startDate: '2026-06-10T00:00:00.000Z',
    endDate:   '2026-06-11T00:00:00.000Z',
    daysRequested: 2,
    reason: 'Medical appointment',
    status: 'Approved',
    adminComment: 'Approved.',
    createdAt: '2026-05-20T00:00:00.000Z',
    user: { name: 'Bob Smith' },
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  getLeaveRequests.mockResolvedValue({ data: REQUESTS });
  approveLeaveRequest.mockResolvedValue({ data: { ...REQUESTS[0], status: 'Approved' } });
  rejectLeaveRequest.mockResolvedValue({ data: { ...REQUESTS[0], status: 'Rejected' } });
  cancelLeaveRequest.mockResolvedValue({ data: {} });
  axios.get.mockResolvedValue({ data: { users: [] } });
});

afterEach(cleanup);

describe('AdminLeavePanel', () => {
  it('shows access denied for non-admin users', () => {
    useUser.mockReturnValue({ user: STAFF_USER });
    render(<AdminLeavePanel />);
    expect(screen.getByText(/do not have permission/i)).toBeInTheDocument();
  });

  it('renders the page heading for admin', async () => {
    useUser.mockReturnValue({ user: ADMIN_USER });
    render(<AdminLeavePanel />);
    expect(screen.getByText(/leave administration/i)).toBeInTheDocument();
  });

  it('loads requests on mount for admin', async () => {
    useUser.mockReturnValue({ user: ADMIN_USER });
    render(<AdminLeavePanel />);
    await waitFor(() => expect(getLeaveRequests).toHaveBeenCalledTimes(1));
  });

  it('loads requests on mount for global_admin', async () => {
    useUser.mockReturnValue({ user: GADMIN_USER });
    render(<AdminLeavePanel />);
    await waitFor(() => expect(getLeaveRequests).toHaveBeenCalledTimes(1));
  });

  it('renders summary chips with correct counts', async () => {
    useUser.mockReturnValue({ user: ADMIN_USER });
    render(<AdminLeavePanel />);
    await waitFor(() => expect(screen.getByText(/total: 2/i)).toBeInTheDocument());
    expect(screen.getByText(/pending: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/approved: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/rejected: 0/i)).toBeInTheDocument();
  });

  it('renders all request rows in the table', async () => {
    useUser.mockReturnValue({ user: ADMIN_USER });
    render(<AdminLeavePanel />);
    await waitFor(() => expect(screen.getByText('Alice Johnson')).toBeInTheDocument());
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
  });

  it('sends status param to backend when Search is clicked', async () => {
    useUser.mockReturnValue({ user: ADMIN_USER });
    render(<AdminLeavePanel />);
    await waitFor(() => screen.getByText('Alice Johnson'));

    // Queue filtered response for the search call
    getLeaveRequests.mockResolvedValueOnce({ data: [REQUESTS[0]] });
    fireEvent.change(screen.getByRole('combobox', { name: /status/i }), { target: { value: 'Pending' } });
    fireEvent.click(screen.getByRole('button', { name: /^search$/i }));

    await waitFor(() => expect(getLeaveRequests).toHaveBeenCalledTimes(2));
    expect(getLeaveRequests).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'Pending' })
    );
    await waitFor(() => expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument());
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
  });

  it('opens the approve modal when Approve is clicked', async () => {
    useUser.mockReturnValue({ user: ADMIN_USER });
    render(<AdminLeavePanel />);
    await waitFor(() => screen.getByRole('button', { name: /^approve$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^approve$/i }));
    expect(screen.getByText('Approve Request')).toBeInTheDocument();
  });

  it('opens the reject modal when Reject is clicked', async () => {
    useUser.mockReturnValue({ user: ADMIN_USER });
    render(<AdminLeavePanel />);
    await waitFor(() => screen.getByRole('button', { name: /^reject$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^reject$/i }));
    expect(screen.getByText('Reject Request')).toBeInTheDocument();
  });

  it('approves a request, shows toast, and reloads the list', async () => {
    useUser.mockReturnValue({ user: ADMIN_USER });
    render(<AdminLeavePanel />);
    // Click table-row Approve button to open modal
    await waitFor(() => screen.getByRole('button', { name: /^approve$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^approve$/i }));
    // Wait for modal, then confirm — now 2 "Approve" buttons exist; pick the modal one (last)
    await waitFor(() => screen.getByText('Approve Request'));
    const btns = screen.getAllByRole('button', { name: /^approve$/i });
    fireEvent.click(btns[btns.length - 1]);
    await waitFor(() => expect(approveLeaveRequest).toHaveBeenCalledWith('r1', ''));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Request approved'));
    await waitFor(() => expect(getLeaveRequests).toHaveBeenCalledTimes(2));
  });

  it('rejects a request with a comment and shows toast', async () => {
    useUser.mockReturnValue({ user: ADMIN_USER });
    render(<AdminLeavePanel />);
    await waitFor(() => screen.getByRole('button', { name: /^reject$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^reject$/i }));
    await waitFor(() => screen.getByText('Reject Request'));
    const modal = screen.getByText('Reject Request').closest('[class*="rounded"]');
    fireEvent.change(within(modal).getByRole('textbox'), { target: { value: 'Not enough coverage' } });
    // Two "Reject" buttons now — table row + modal; pick the modal one (last)
    const btns = screen.getAllByRole('button', { name: /^reject$/i });
    fireEvent.click(btns[btns.length - 1]);
    await waitFor(() =>
      expect(rejectLeaveRequest).toHaveBeenCalledWith('r1', 'Not enough coverage')
    );
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Request rejected'));
  });

  it('shows error toast when approve action fails', async () => {
    approveLeaveRequest.mockRejectedValue({ response: { data: { message: 'Already approved' } } });
    useUser.mockReturnValue({ user: ADMIN_USER });
    render(<AdminLeavePanel />);
    await waitFor(() => screen.getByRole('button', { name: /^approve$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^approve$/i }));
    await waitFor(() => screen.getByText('Approve Request'));
    const btns = screen.getAllByRole('button', { name: /^approve$/i });
    fireEvent.click(btns[btns.length - 1]);
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Already approved'));
  });

  it('switches to Entitlements tab and renders EntitlementEditor', async () => {
    useUser.mockReturnValue({ user: ADMIN_USER });
    render(<AdminLeavePanel />);
    fireEvent.click(screen.getByRole('button', { name: /entitlements/i }));
    expect(screen.getByTestId('entitlement-editor')).toBeInTheDocument();
  });
});
