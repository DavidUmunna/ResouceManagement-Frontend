import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import EntitlementEditor from '../src/pages/Leave/AdminLeavePanel/EntitlementEditor';

jest.mock('../src/services/leaveService', () => ({
  getUserBalance:    jest.fn(),
  updateEntitlement: jest.fn(),
  getPolicy:         jest.fn(),
  updatePolicy:      jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

import { getUserBalance, updateEntitlement, getPolicy, updatePolicy } from '../src/services/leaveService';
import { toast } from 'react-toastify';

const USERS = {
  data: [
    { _id: 'u1', name: 'Alice Johnson', role: 'human_resources' },
    { _id: 'u2', name: 'Bob Smith',     role: 'procurement_officer' },
  ],
};

const MOCK_POLICY = {
  Annual: 21, Sick: 10, Maternity: 90, Paternity: 5, Emergency: 3, Unpaid: 0,
};

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
  getPolicy.mockResolvedValue({ data: MOCK_POLICY });
  updatePolicy.mockResolvedValue({ data: MOCK_POLICY });
  getUserBalance.mockResolvedValue({ data: MOCK_BALANCE });
  updateEntitlement.mockResolvedValue({});
});

afterEach(cleanup);

describe('EntitlementEditor', () => {
  // ── Policy (bulk) panel ─────────────────────────────────────────────────────
  describe('BulkDefaults — policy panel', () => {
    it('renders the policy section heading', async () => {
      render(<EntitlementEditor users={USERS} />);
      await waitFor(() =>
        expect(screen.getByText(/organisation leave policy/i)).toBeInTheDocument()
      );
    });

    it('fetches the current policy on mount and seeds the inputs', async () => {
      render(<EntitlementEditor users={USERS} />);
      await waitFor(() => expect(getPolicy).toHaveBeenCalledTimes(1));
      const annualInput = await screen.findByRole('spinbutton', { name: /annual entitlement/i });
      expect(annualInput).toHaveValue(21);
    });

    it('shows an error toast when getPolicy fails', async () => {
      getPolicy.mockRejectedValue(new Error('network'));
      render(<EntitlementEditor users={USERS} />);
      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith('Failed to load current policy')
      );
    });

    it('calls updatePolicy with current values on Save Policy click', async () => {
      render(<EntitlementEditor users={USERS} />);
      const saveBtn = await screen.findByRole('button', { name: /save policy/i });
      fireEvent.click(saveBtn);
      await waitFor(() =>
        expect(updatePolicy).toHaveBeenCalledWith(expect.objectContaining({ Annual: 21, Sick: 10 }))
      );
      await waitFor(() =>
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringMatching(/leave policy saved/i)
        )
      );
    });

    it('sends the updated value when an input is changed before saving', async () => {
      render(<EntitlementEditor users={USERS} />);
      const annualInput = await screen.findByRole('spinbutton', { name: /annual entitlement/i });
      fireEvent.change(annualInput, { target: { value: '25' } });
      fireEvent.click(screen.getByRole('button', { name: /save policy/i }));
      await waitFor(() =>
        expect(updatePolicy).toHaveBeenCalledWith(expect.objectContaining({ Annual: 25 }))
      );
    });

    it('shows error toast when updatePolicy fails', async () => {
      updatePolicy.mockRejectedValue(new Error('server error'));
      render(<EntitlementEditor users={USERS} />);
      const saveBtn = await screen.findByRole('button', { name: /save policy/i });
      fireEvent.click(saveBtn);
      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith('Failed to save policy')
      );
    });

    it('resets inputs to hardcoded defaults when Reset is clicked', async () => {
      render(<EntitlementEditor users={USERS} />);
      const annualInput = await screen.findByRole('spinbutton', { name: /annual entitlement/i });
      fireEvent.change(annualInput, { target: { value: '99' } });
      expect(annualInput).toHaveValue(99);
      fireEvent.click(screen.getByRole('button', { name: /reset to defaults/i }));
      expect(annualInput).toHaveValue(21);
    });

    it('does NOT call updateEntitlement (no per-user loop)', async () => {
      render(<EntitlementEditor users={USERS} />);
      const saveBtn = await screen.findByRole('button', { name: /save policy/i });
      fireEvent.click(saveBtn);
      await waitFor(() => expect(updatePolicy).toHaveBeenCalled());
      expect(updateEntitlement).not.toHaveBeenCalled();
    });
  });

  // ── Per-user panel ──────────────────────────────────────────────────────────
  describe('UserEditor — per-user panel', () => {
    it('renders user dropdown with all provided employees', async () => {
      render(<EntitlementEditor users={USERS} />);
      await waitFor(() => screen.getByRole('combobox', { name: /select employee/i }));
      expect(screen.getByText('Alice Johnson (human_resources)')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith (procurement_officer)')).toBeInTheDocument();
    });

    it('does not fetch balance when no user is selected', async () => {
      render(<EntitlementEditor users={USERS} />);
      await waitFor(() => expect(getPolicy).toHaveBeenCalled());
      expect(getUserBalance).not.toHaveBeenCalled();
    });

    it('fetches balance when a user is selected', async () => {
      render(<EntitlementEditor users={USERS} />);
      fireEvent.change(
        await screen.findByRole('combobox', { name: /select employee/i }),
        { target: { value: 'u1' } }
      );
      await waitFor(() => expect(getUserBalance).toHaveBeenCalledWith('u1'));
    });

    it('calls updateEntitlement for all 6 types on Save All and shows toast', async () => {
      render(<EntitlementEditor users={USERS} />);
      fireEvent.change(
        await screen.findByRole('combobox', { name: /select employee/i }),
        { target: { value: 'u1' } }
      );
      await waitFor(() => screen.getByRole('button', { name: /save all changes/i }));

      const annualInputs = screen.getAllByRole('spinbutton', { name: /annual entitlement/i });
      fireEvent.change(annualInputs[annualInputs.length - 1], { target: { value: '25' } });

      fireEvent.click(screen.getByRole('button', { name: /save all changes/i }));
      await waitFor(() => expect(updateEntitlement).toHaveBeenCalledWith('u1', 'Annual', 25));
      await waitFor(() => expect(updateEntitlement).toHaveBeenCalledTimes(6));
      await waitFor(() =>
        expect(toast.success).toHaveBeenCalledWith('All entitlements saved')
      );
    });

    it('shows error toast when updateEntitlement fails on Save All', async () => {
      updateEntitlement.mockRejectedValue(new Error('network'));
      render(<EntitlementEditor users={USERS} />);
      fireEvent.change(
        await screen.findByRole('combobox', { name: /select employee/i }),
        { target: { value: 'u1' } }
      );
      await waitFor(() => screen.getByRole('button', { name: /save all changes/i }));
      fireEvent.click(screen.getByRole('button', { name: /save all changes/i }));
      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/failed to save/i))
      );
    });

    it('shows error toast when getUserBalance fails', async () => {
      getUserBalance.mockRejectedValue(new Error('Not found'));
      render(<EntitlementEditor users={USERS} />);
      fireEvent.change(
        await screen.findByRole('combobox', { name: /select employee/i }),
        { target: { value: 'u1' } }
      );
      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith('Failed to load balance')
      );
    });
  });
});
