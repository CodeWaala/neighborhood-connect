import { act, renderHook } from '@testing-library/react-native';

import { useDebouncedValue } from '../useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('only updates after the value stops changing', async () => {
    const { result, rerender } = await renderHook((props: { value: string }) => useDebouncedValue(props.value, 300), {
      initialProps: { value: 'a' },
    });
    expect(result.current).toBe('a');

    await rerender({ value: 'al' });
    await act(() => jest.advanceTimersByTime(200));
    await rerender({ value: 'alb' });
    await act(() => jest.advanceTimersByTime(200));
    expect(result.current).toBe('a');

    await act(() => jest.advanceTimersByTime(100));
    expect(result.current).toBe('alb');
  });
});
