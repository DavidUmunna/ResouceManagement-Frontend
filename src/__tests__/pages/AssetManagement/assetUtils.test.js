import { CONDITION_STYLES, formatCurrency, formatDate } from '../../../pages/AssetManagement/assetUtils';

describe('formatCurrency', () => {
  it('prefixes ₦ and adds thousands separators', () => {
    expect(formatCurrency(5000)).toBe('₦5,000');
    expect(formatCurrency(1234567)).toBe('₦1,234,567');
  });

  it('treats null/undefined/empty as 0', () => {
    expect(formatCurrency(null)).toBe('₦0');
    expect(formatCurrency(undefined)).toBe('₦0');
    expect(formatCurrency(0)).toBe('₦0');
  });
});

describe('formatDate', () => {
  it('takes the date portion of an ISO timestamp', () => {
    expect(formatDate('2026-02-15T09:30:00.000Z')).toBe('2026-02-15');
  });

  it('returns an em dash for empty input', () => {
    expect(formatDate('')).toBe('—');
    expect(formatDate(undefined)).toBe('—');
  });
});

describe('CONDITION_STYLES', () => {
  it('maps each known condition to a style', () => {
    expect(CONDITION_STYLES.New).toMatch(/green/);
    expect(CONDITION_STYLES.Damaged).toMatch(/red/);
    expect(Object.keys(CONDITION_STYLES)).toEqual(
      expect.arrayContaining(['New', 'Used', 'Refurbished', 'Damaged', 'OK'])
    );
  });
});
