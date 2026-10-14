import { formatTimeRange, neighborhoodDetail, rangeStartHour } from '../format';

describe('neighborhoodDetail', () => {
  it('formats "City, Region ZIP" and skips missing parts', () => {
    const base = { id: 'n', name: 'Hawthorne' };
    expect(neighborhoodDetail({ ...base, city: 'Portland', region: 'OR', postalCode: '97214' })).toBe(
      'Portland, OR 97214',
    );
    expect(neighborhoodDetail({ ...base, city: 'Portland', region: null, postalCode: '97214' })).toBe(
      'Portland, 97214',
    );
    expect(neighborhoodDetail({ ...base, city: null, region: null, postalCode: null })).toBe('');
  });
});

describe('time ranges', () => {
  it('adds spaced en dashes', () => {
    expect(formatTimeRange('6am-12pm')).toBe('6am – 12pm');
    expect(formatTimeRange('5pm - 9pm')).toBe('5pm – 9pm');
  });

  it.each([
    ['6am-12pm', 6],
    ['12pm-5pm', 12],
    ['5pm-9pm', 17],
    ['12am-6am', 0],
    ['whenever', 24],
  ])('start hour of %s is %i', (range, hour) => {
    expect(rangeStartHour(range)).toBe(hour);
  });
});
