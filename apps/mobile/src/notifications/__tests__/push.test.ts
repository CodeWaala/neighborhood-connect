import { parsePushData } from '../push';

describe('parsePushData', () => {
  it.each(['connection_request', 'connection_accepted', 'message'] as const)('accepts %s', (type) => {
    expect(parsePushData({ type, connectionId: 'c1' })).toEqual({ type, connectionId: 'c1' });
  });

  it.each([
    ['nothing', undefined],
    ['a string', 'message'],
    ['an unknown type', { type: 'marketing', connectionId: 'c1' }],
    ['a missing connection', { type: 'message' }],
    ['a non-string connection', { type: 'message', connectionId: 42 }],
  ])('ignores %s', (_label, data) => {
    expect(parsePushData(data)).toBeNull();
  });
});
