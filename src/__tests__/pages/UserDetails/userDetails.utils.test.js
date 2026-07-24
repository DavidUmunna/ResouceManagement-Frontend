import { timeAgo, formatDate, getInitials, calculateStats } from '../../../pages/UserDetails/userDetails.utils';

describe('timeAgo', () => {
  const now = Date.now();
  const ago = (ms) => new Date(now - ms).toISOString();

  it('returns "just now" for < 1 minute', () => {
    expect(timeAgo(ago(30 * 1000))).toBe('just now');
  });

  it('returns singular minute', () => {
    expect(timeAgo(ago(60 * 1000))).toBe('1 minute ago');
  });

  it('returns plural minutes', () => {
    expect(timeAgo(ago(5 * 60 * 1000))).toBe('5 minutes ago');
  });

  it('returns singular hour', () => {
    expect(timeAgo(ago(60 * 60 * 1000))).toBe('1 hour ago');
  });

  it('returns plural hours', () => {
    expect(timeAgo(ago(3 * 60 * 60 * 1000))).toBe('3 hours ago');
  });

  it('returns days once past 24 hours', () => {
    expect(timeAgo(ago(2 * 24 * 60 * 60 * 1000))).toBe('2 days ago');
  });

  it('returns "" for empty or invalid input', () => {
    expect(timeAgo('')).toBe('');
    expect(timeAgo(undefined)).toBe('');
    expect(timeAgo('not-a-date')).toBe('');
  });
});

describe('formatDate', () => {
  it('formats an ISO date to "MMM d, yyyy"', () => {
    // Day can shift by TZ (UTC-midnight parse); assert the stable parts
    expect(formatDate('2026-02-15T09:30:00.000Z')).toMatch(/Feb \d{1,2}, 2026/);
  });

  it('returns "N/A" for empty input', () => {
    expect(formatDate('')).toBe('N/A');
    expect(formatDate(null)).toBe('N/A');
  });
});

describe('getInitials', () => {
  it('builds uppercase initials from a full name', () => {
    expect(getInitials('John Staff')).toBe('JS');
  });

  it('handles a single name', () => {
    expect(getInitials('Madonna')).toBe('M');
  });

  it('falls back to "U" when name is missing', () => {
    expect(getInitials('')).toBe('U');
    expect(getInitials(undefined)).toBe('U');
  });
});

describe('calculateStats', () => {
  it('computes approval rate over the total across all buckets', () => {
    const approved = [{ createdAt: '2026-02-01', Approvals: [] }, {}];
    const rejected = [{}];
    const pending  = [{}];
    const completed = [];
    const moreInfo = [];
    const stats = calculateStats(approved, rejected, pending, completed, moreInfo);
    // 2 approved of 4 total → 50%
    expect(stats.totalRequests).toBe(4);
    expect(stats.approvalRate).toBe(50);
  });

  it('returns 0% approval rate when there are no requests', () => {
    const stats = calculateStats([], [], [], [], []);
    expect(stats.totalRequests).toBe(0);
    expect(stats.approvalRate).toBe(0);
  });
});
