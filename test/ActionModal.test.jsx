import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ActionModal from '../src/pages/Leave/AdminLeavePanel/ActionModal';

const MOCK_REQUEST = {
  _id: 'req-1',
  leaveType: 'Annual',
  daysRequested: 5,
  reason: 'Family holiday trip',
  user: { name: 'Jane Smith' },
};

afterEach(cleanup);

describe('ActionModal', () => {
  it('renders nothing when request is null', () => {
    const { container } = render(
      <ActionModal request={null} action="approve" onConfirm={jest.fn()} onClose={jest.fn()} loading={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders request details inside the modal', () => {
    render(
      <ActionModal request={MOCK_REQUEST} action="approve" onConfirm={jest.fn()} onClose={jest.fn()} loading={false} />
    );
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Annual')).toBeInTheDocument();
    expect(screen.getByText('Family holiday trip')).toBeInTheDocument();
  });

  it('shows "Approve Request" title for approve action', () => {
    render(
      <ActionModal request={MOCK_REQUEST} action="approve" onConfirm={jest.fn()} onClose={jest.fn()} loading={false} />
    );
    expect(screen.getByText('Approve Request')).toBeInTheDocument();
  });

  it('shows "Reject Request" title for reject action', () => {
    render(
      <ActionModal request={MOCK_REQUEST} action="reject" onConfirm={jest.fn()} onClose={jest.fn()} loading={false} />
    );
    expect(screen.getByText('Reject Request')).toBeInTheDocument();
  });

  it('Approve button is enabled without a comment (comment is optional)', () => {
    render(
      <ActionModal request={MOCK_REQUEST} action="approve" onConfirm={jest.fn()} onClose={jest.fn()} loading={false} />
    );
    expect(screen.getByRole('button', { name: /approve/i })).not.toBeDisabled();
  });

  it('Reject button is disabled without a comment (comment is required)', () => {
    render(
      <ActionModal request={MOCK_REQUEST} action="reject" onConfirm={jest.fn()} onClose={jest.fn()} loading={false} />
    );
    expect(screen.getByRole('button', { name: /reject/i })).toBeDisabled();
  });

  it('Reject button becomes enabled once a comment is typed', () => {
    render(
      <ActionModal request={MOCK_REQUEST} action="reject" onConfirm={jest.fn()} onClose={jest.fn()} loading={false} />
    );
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Not this period' } });
    expect(screen.getByRole('button', { name: /reject/i })).not.toBeDisabled();
  });

  it('calls onConfirm with request id and comment on approve', () => {
    const onConfirm = jest.fn();
    render(
      <ActionModal request={MOCK_REQUEST} action="approve" onConfirm={onConfirm} onClose={jest.fn()} loading={false} />
    );
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Looks good' } });
    fireEvent.click(screen.getByRole('button', { name: /approve/i }));
    expect(onConfirm).toHaveBeenCalledWith('req-1', 'Looks good');
  });

  it('calls onConfirm with request id and comment on reject', () => {
    const onConfirm = jest.fn();
    render(
      <ActionModal request={MOCK_REQUEST} action="reject" onConfirm={onConfirm} onClose={jest.fn()} loading={false} />
    );
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Budget freeze in place' } });
    fireEvent.click(screen.getByRole('button', { name: /reject/i }));
    expect(onConfirm).toHaveBeenCalledWith('req-1', 'Budget freeze in place');
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = jest.fn();
    render(
      <ActionModal request={MOCK_REQUEST} action="approve" onConfirm={jest.fn()} onClose={onClose} loading={false} />
    );
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows "Processing" and disables Cancel when loading', () => {
    render(
      <ActionModal request={MOCK_REQUEST} action="approve" onConfirm={jest.fn()} onClose={jest.fn()} loading={true} />
    );
    expect(screen.getByText(/processing/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
  });
});
