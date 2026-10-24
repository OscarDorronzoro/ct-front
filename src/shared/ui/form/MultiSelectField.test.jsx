// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MultiSelectField from './MultiSelectField';

const options = [{ value: 2, label: 'Rodeo 1' }, { value: 3, label: 'Rodeo 2' }];

function setup(values) {
  const onChange = vi.fn();
  render(<MultiSelectField label="Grupos" name="groupIds" values={values} onChange={onChange} options={options} />);
  return { onChange, user: userEvent.setup() };
}

const lastValue = (onChange) => onChange.mock.lastCall[0].target.value;

describe('MultiSelectField', () => {
  it('adds a selection', async () => {
    const { onChange, user } = setup([2]);

    await user.click(screen.getByRole('button', { name: 'Agregar otro' }));
    await user.click(screen.getByRole('button', { name: 'Seleccione una opción' }));
    await user.click(screen.getByRole('option', { name: 'Rodeo 2' }));

    expect(lastValue(onChange)).toEqual([2, 3]);
  });

  it('removes one of several selections', async () => {
    const { onChange, user } = setup([2, 3]);

    await user.click(screen.getAllByRole('button', { name: 'Quitar' })[0]);

    expect(lastValue(onChange)).toEqual([3]);
  });

  it('removes the last selection, leaving the list empty', async () => {
    const { onChange, user } = setup([2]);

    await user.click(screen.getByRole('button', { name: 'Quitar' }));

    expect(lastValue(onChange)).toEqual([]);
  });

  it('starts from an empty list: adding shows a second selector', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<MultiSelectField name="groupIds" values={[]} onChange={onChange} options={options} addLabel="Agregar grupo" />);

    await user.click(screen.getByRole('button', { name: 'Agregar grupo' }));

    expect(screen.getAllByRole('button', { name: 'Seleccione una opción' })).toHaveLength(2);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('offers no remove button for a single empty selector', () => {
    setup([]);

    expect(screen.queryByRole('button', { name: 'Quitar' })).not.toBeInTheDocument();
  });
});
