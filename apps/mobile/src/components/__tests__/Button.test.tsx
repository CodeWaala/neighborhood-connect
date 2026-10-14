import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from '../Button';

describe('Button', () => {
  it('calls onPress', async () => {
    const onPress = jest.fn();
    await render(<Button label="Continue" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is disabled (and says so) when disabled or loading', async () => {
    const onPress = jest.fn();
    await render(
      <>
        <Button label="Save" onPress={onPress} disabled />
        <Button label="Send" onPress={onPress} loading />
      </>,
    );
    const save = screen.getByRole('button', { name: 'Save' });
    const send = screen.getByRole('button', { name: 'Send' });
    expect(save).toBeDisabled();
    expect(send).toBeDisabled();
    expect(send).toBeBusy();

    await fireEvent.press(save);
    await fireEvent.press(send);
    expect(onPress).not.toHaveBeenCalled();
  });
});
