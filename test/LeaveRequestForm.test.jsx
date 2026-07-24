import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import LeaveRequestForm from '../src/pages/Leave/LeaveRequestForm';

const LEAVE_TYPES = ['Annual', 'Sick', 'Maternity', 'Paternity', 'Emergency', 'Unpaid'];
const FUTURE_START = '2026-09-01';
const FUTURE_END   = '2026-09-05';

afterEach(cleanup);

describe('LeaveRequestForm', () => {
  it('renders all form fields and the submit button', () => {
    render(<LeaveRequestForm onSubmit={jest.fn()} loading={false} />);
    expect(screen.getByLabelText(/leave type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/reason/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit request/i })).toBeInTheDocument();
  });

  it('populates the leave type dropdown with all 6 types', () => {
    render(<LeaveRequestForm onSubmit={jest.fn()} loading={false} />);
    const options = Array.from(screen.getByLabelText(/leave type/i).options).map((o) => o.value);
    LEAVE_TYPES.forEach((t) => expect(options).toContain(t));
  });

  it('shows validation error when reason is too short', async () => {
    render(<LeaveRequestForm onSubmit={jest.fn()} loading={false} />);
    fireEvent.change(screen.getByLabelText(/reason/i), { target: { value: 'hi' } });
    fireEvent.submit(document.querySelector('form'));
    await waitFor(() =>
      expect(screen.getByText(/at least 5 characters/i)).toBeInTheDocument()
    );
  });

  it('shows validation error when end date is before start date', async () => {
    render(<LeaveRequestForm onSubmit={jest.fn()} loading={false} />);
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: FUTURE_END } });
    fireEvent.change(screen.getByLabelText(/end date/i),   { target: { value: FUTURE_START } });
    fireEvent.change(screen.getByLabelText(/reason/i),     { target: { value: 'Family holiday trip' } });
    fireEvent.submit(document.querySelector('form'));
    await waitFor(() =>
      expect(screen.getByText(/end date must be on or after/i)).toBeInTheDocument()
    );
  });

  it('clears the reason error when the field is changed', async () => {
    render(<LeaveRequestForm onSubmit={jest.fn()} loading={false} />);
    fireEvent.submit(document.querySelector('form'));
    await waitFor(() => expect(screen.getByText(/at least 5 characters/i)).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/reason/i), { target: { value: 'Enough characters now' } });
    expect(screen.queryByText(/at least 5 characters/i)).not.toBeInTheDocument();
  });

  it('calls onSubmit with the correct payload on a valid form', async () => {
    const onSubmit = jest.fn().mockResolvedValue();
    render(<LeaveRequestForm onSubmit={onSubmit} loading={false} />);

    fireEvent.change(screen.getByLabelText(/leave type/i), { target: { value: 'Sick' } });
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: FUTURE_START } });
    fireEvent.change(screen.getByLabelText(/end date/i),   { target: { value: FUTURE_END } });
    fireEvent.change(screen.getByLabelText(/reason/i),     { target: { value: 'Medical appointment and recovery' } });
    fireEvent.submit(document.querySelector('form'));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        leaveType: 'Sick',
        startDate: FUTURE_START,
        endDate:   FUTURE_END,
        reason:    'Medical appointment and recovery',
      })
    );
  });

  it('does not call onSubmit when form is invalid', async () => {
    const onSubmit = jest.fn();
    render(<LeaveRequestForm onSubmit={onSubmit} loading={false} />);
    fireEvent.submit(document.querySelector('form'));
    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
  });

  it('shows submitting text and disables the button when loading', () => {
    render(<LeaveRequestForm onSubmit={jest.fn()} loading={true} />);
    expect(screen.getByText(/submitting/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('disables the leave type select when loading', () => {
    render(<LeaveRequestForm onSubmit={jest.fn()} loading={true} />);
    expect(screen.getByLabelText(/leave type/i)).toBeDisabled();
  });

  describe('serverError prop', () => {
    it('renders nothing when serverError is null', () => {
      render(<LeaveRequestForm onSubmit={jest.fn()} loading={false} serverError={null} />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows the error message', () => {
      render(
        <LeaveRequestForm
          onSubmit={jest.fn()}
          loading={false}
          serverError={{ message: 'Insufficient leave balance for the requested period', detail: null }}
        />
      );
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/insufficient leave balance/i)).toBeInTheDocument();
    });

    it('shows detail reason when provided', () => {
      render(
        <LeaveRequestForm
          onSubmit={jest.fn()}
          loading={false}
          serverError={{
            message: 'Insufficient leave balance for the requested period',
            detail: {
              reason: 'You have 18 day(s) already taken. Requesting 5 more would exceed your 21-day Annual entitlement.',
              remaining: 3,
              policy: { Annual: 21 },
            },
          }}
        />
      );
      expect(screen.getByText(/18 day\(s\) already taken/i)).toBeInTheDocument();
      expect(screen.getByText(/remaining balance/i)).toBeInTheDocument();
      expect(screen.getByText(/3 day\(s\)/i)).toBeInTheDocument();
      expect(screen.getByText(/policy limit/i)).toBeInTheDocument();
      expect(screen.getByText(/annual — 21 days/i)).toBeInTheDocument();
    });

    it('shows detail for policy exceeded error without remaining field', () => {
      render(
        <LeaveRequestForm
          onSubmit={jest.fn()}
          loading={false}
          serverError={{
            message: 'Requested days exceed the organisation policy limit for this leave type',
            detail: {
              reason: 'A single Annual leave request cannot exceed 21 working days as set by the organisation policy.',
              requested: 25,
              policy: { Annual: 21 },
            },
          }}
        />
      );
      expect(screen.getByText(/cannot exceed 21 working days/i)).toBeInTheDocument();
      expect(screen.queryByText(/remaining balance/i)).not.toBeInTheDocument();
      expect(screen.getByText(/annual — 21 days/i)).toBeInTheDocument();
    });
  });
});
