import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RangePicker from './RangePicker';
import { presetRange } from '@/shared/lib/date';

const NOW = new Date(2026, 9, 14, 10, 0);

function setup(range = presetRange('today', NOW)) {
  const onChange = vi.fn();
  render(<RangePicker range={range} onChange={onChange} />);
  return onChange;
}

const openPanel = () => fireEvent.click(screen.getByRole('button', { expanded: false, name: /→/ }));
const setInput = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe('RangePicker', () => {
  beforeEach(() => {
    // Only the clock: the component's intervals keep working
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the current range', () => {
    setup();

    expect(screen.getByText('Hoy')).toBeInTheDocument();
    expect(screen.getByText('00:00 → ahora')).toBeInTheDocument();
  });

  it('applies a preset and closes the panel', () => {
    const onChange = setup();

    openPanel();
    fireEvent.click(screen.getByRole('button', { name: 'Ayer' }));

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ preset: 'yesterday', live: false }));
    expect(screen.queryByRole('button', { name: 'Aplicar' })).not.toBeInTheDocument();
  });

  it('applies the custom fields only with "Aplicar"', () => {
    const onChange = setup();

    openPanel();
    fireEvent.click(screen.getByRole('switch'));
    setInput('Fecha desde', '2026-10-13');
    setInput('Hora desde', '08:00');
    setInput('Fecha hasta', '2026-10-13');
    setInput('Hora hasta', '12:30');

    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(onChange).toHaveBeenCalledWith({
      preset: 'custom', from: new Date(2026, 9, 13, 8, 0), to: new Date(2026, 9, 13, 12, 30), live: false,
    });
  });

  it('shows the error of an invalid custom range and keeps the panel open', () => {
    const onChange = setup();

    openPanel();
    fireEvent.click(screen.getByRole('switch'));
    setInput('Fecha desde', '2026-10-13');
    setInput('Hora desde', '18:00');
    setInput('Fecha hasta', '2026-10-13');
    setInput('Hora hasta', '08:00');
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(screen.getByText('"Desde" tiene que ser anterior a "Hasta".')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('moves to the previous period, and cannot go past now', () => {
    const onChange = setup();

    expect(screen.getByRole('button', { name: 'Período siguiente' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Período anterior' }));

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      from: new Date(2026, 9, 13, 14, 0), to: new Date(2026, 9, 14, 0, 0), live: false,
    }));
  });
});
