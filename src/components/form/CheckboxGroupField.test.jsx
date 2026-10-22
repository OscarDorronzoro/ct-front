// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CheckboxGroupField from './CheckboxGroupField';

const options = [
  { value: 'admin', label: 'Administrador', disabled: true },
  { value: 'manager', label: 'Encargado', description: 'Vacas y zonas' },
  { value: 'viewer', label: 'Consulta' },
];

function renderField(values) {
  const onChange = vi.fn();
  render(<CheckboxGroupField label="Roles" name="roles" values={values} onChange={onChange} options={options} />);
  return { onChange, user: userEvent.setup() };
}

describe('CheckboxGroupField', () => {
  it('adds a value, keeping the order of the options', async () => {
    const { onChange, user } = renderField(['viewer']);

    await user.click(screen.getByLabelText(/Encargado/));

    expect(onChange).toHaveBeenCalledWith({ target: { name: 'roles', value: ['manager', 'viewer'] } });
  });

  it('removes a value', async () => {
    const { onChange, user } = renderField(['manager', 'viewer']);

    await user.click(screen.getByLabelText(/Consulta/));

    expect(onChange).toHaveBeenCalledWith({ target: { name: 'roles', value: ['manager'] } });
  });

  it('does not change a disabled option', async () => {
    const { onChange, user } = renderField(['admin']);

    expect(screen.getByLabelText(/Administrador/)).toBeDisabled();
    await user.click(screen.getByLabelText(/Administrador/));

    expect(onChange).not.toHaveBeenCalled();
  });
});
