import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import BalanceSummary from '../src/pages/Leave/BalanceSummary';

const MOCK_BALANCE = {
  summary: {
    Annual:    { entitlement: 21, taken: 5,  balance: 16 },
    Sick:      { entitlement: 10, taken: 2,  balance: 8  },
    Maternity: { entitlement: 90, taken: 0,  balance: 90 },
    Paternity: { entitlement: 5,  taken: 0,  balance: 5  },
    Emergency: { entitlement: 3,  taken: 1,  balance: 2  },
    Unpaid:    { entitlement: 0,  taken: 0,  balance: 0  },
  },
};

afterEach(cleanup);

describe('BalanceSummary', () => {
  it('renders 6 loading skeletons when loading is true', () => {
    const { container } = render(<BalanceSummary balance={null} loading={true} />);
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(6);
  });

  it('renders nothing when balance is null and not loading', () => {
    const { container } = render(<BalanceSummary balance={null} loading={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders all 6 leave type labels', () => {
    render(<BalanceSummary balance={MOCK_BALANCE} loading={false} />);
    ['Annual', 'Sick', 'Maternity', 'Paternity', 'Emergency', 'Unpaid'].forEach((type) => {
      expect(screen.getByText(type)).toBeInTheDocument();
    });
  });

  it('displays remaining balance as the large number for each type', () => {
    render(<BalanceSummary balance={MOCK_BALANCE} loading={false} />);
    expect(screen.getByText('16')).toBeInTheDocument(); // Annual
    expect(screen.getByText('8')).toBeInTheDocument();  // Sick
    expect(screen.getByText('90')).toBeInTheDocument(); // Maternity
  });

  it('shows entitlement/taken summary text', () => {
    render(<BalanceSummary balance={MOCK_BALANCE} loading={false} />);
    expect(screen.getByText('5 / 21 days used')).toBeInTheDocument();
    expect(screen.getByText('2 / 10 days used')).toBeInTheDocument();
  });

  it('handles zero entitlement gracefully (Unpaid type)', () => {
    render(<BalanceSummary balance={MOCK_BALANCE} loading={false} />);
    expect(screen.getByText('0 / 0 days used')).toBeInTheDocument();
  });

  it('handles balance with missing leave type keys without crashing', () => {
    const partial = { summary: { Annual: { entitlement: 21, taken: 0, balance: 21 } } };
    expect(() => render(<BalanceSummary balance={partial} loading={false} />)).not.toThrow();
  });

  it('renders 6 "left" labels — one per card', () => {
    render(<BalanceSummary balance={MOCK_BALANCE} loading={false} />);
    expect(screen.getAllByText('left')).toHaveLength(6);
  });
});
