import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import MyLeaveRequests from '../src/pages/Leave/MyLeaveRequests';

const REQUESTS = [
  {
    _id: 'r1',
    leaveType: 'Annual',
    startDate: '2026-07-01T00:00:00.000Z',
    endDate:   '2026-07-05T00:00:00.000Z',
    daysRequested: 5,
    status: 'Pending',
    adminComment: '',
  },
  {
    _id: 'r2',
    leaveType: 'Sick',
    startDate: '2026-06-10T00:00:00.000Z',
    endDate:   '2026-06-11T00:00:00.000Z',
    daysRequested: 2,
    status: 'Approved',
    adminComment: 'Approved.',
  },
  {
    _id: 'r3',
    leaveType: 'Emergency',
    startDate: '2026-05-01T00:00:00.000Z',
    endDate:   '2026-05-02T00:00:00.000Z',
    daysRequested: 2,
    status: 'Rejected',
    adminComment: 'Not this period',
  },
  {
    _id: 'r4',
    leaveType: 'Paternity',
    startDate: '2026-04-01T00:00:00.000Z',
    endDate:   '2026-04-05T00:00:00.000Z',
    daysRequested: 5,
    status: 'Cancelled',
    adminComment: '',
  },
];

afterEach(cleanup);

describe('MyLeaveRequests', () => {
  it('renders 3 loading skeletons when loading', () => {
    const { container } = render(
      <MyLeaveRequests requests={[]} loading={true} onCancel={jest.fn()} />
    );
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(3);
  });

  it('shows empty state message when there are no requests', () => {
    render(<MyLeaveRequests requests={[]} loading={false} onCancel={jest.fn()} />);
    expect(screen.getByText(/no leave requests yet/i)).toBeInTheDocument();
  });

  it('renders a row for each request', () => {
    render(<MyLeaveRequests requests={REQUESTS} loading={false} onCancel={jest.fn()} />);
    expect(screen.getByText('Annual')).toBeInTheDocument();
    expect(screen.getByText('Sick')).toBeInTheDocument();
    expect(screen.getByText('Emergency')).toBeInTheDocument();
    expect(screen.getByText('Paternity')).toBeInTheDocument();
  });

  it('shows Cancel button only for Pending requests', () => {
    render(<MyLeaveRequests requests={REQUESTS} loading={false} onCancel={jest.fn()} />);
    expect(screen.getAllByRole('button', { name: /cancel/i })).toHaveLength(1);
  });

  it('calls onCancel with the correct id', () => {
    const onCancel = jest.fn();
    render(<MyLeaveRequests requests={REQUESTS} loading={false} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledWith('r1');
  });

  it('renders status badges for all four statuses', () => {
    render(<MyLeaveRequests requests={REQUESTS} loading={false} onCancel={jest.fn()} />);
    ['Pending', 'Approved', 'Rejected', 'Cancelled'].forEach((s) =>
      expect(screen.getByText(s)).toBeInTheDocument()
    );
  });

  it('shows adminComment when present and dash when empty', () => {
    render(<MyLeaveRequests requests={REQUESTS} loading={false} onCancel={jest.fn()} />);
    expect(screen.getByText('Approved.')).toBeInTheDocument();
    expect(screen.getByText('Not this period')).toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
  });

  it('shows correct day counts in each row', () => {
    render(<MyLeaveRequests requests={REQUESTS} loading={false} onCancel={jest.fn()} />);
    // r1 and r4 both have 5 days; r2 and r3 both have 2 days
    expect(screen.getAllByText('5')).toHaveLength(2);
    expect(screen.getAllByText('2')).toHaveLength(2);
  });
});
