import { describe, it, expect, vi } from 'vitest';
import { useRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useClickOutside from './useClickOutside';

function Menu({ onOutside, enabled }) {
  const ref = useRef(null);
  useClickOutside(ref, onOutside, enabled);

  return (
    <div>
      <div ref={ref}><button type="button">Dentro</button></div>
      <button type="button">Fuera</button>
    </div>
  );
}

describe('useClickOutside', () => {
  it('calls onOutside only for presses outside the element', async () => {
    const onOutside = vi.fn();
    const user = userEvent.setup();
    render(<Menu onOutside={onOutside} />);

    await user.click(screen.getByRole('button', { name: 'Dentro' }));
    expect(onOutside).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Fuera' }));
    expect(onOutside).toHaveBeenCalledOnce();
  });

  it('does nothing while disabled', async () => {
    const onOutside = vi.fn();
    const user = userEvent.setup();
    render(<Menu onOutside={onOutside} enabled={false} />);

    await user.click(screen.getByRole('button', { name: 'Fuera' }));
    expect(onOutside).not.toHaveBeenCalled();
  });
});
