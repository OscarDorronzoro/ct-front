import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SelectField from './SelectField';

const options = [{ value: 'female', label: 'Hembra' }, { value: 'male', label: 'Macho' }];

describe('SelectField', () => {
  it('is a combobox named by its label, showing the chosen option', () => {
    render(<SelectField label="Sexo" name="sex" value="female" options={options} onChange={() => {}} required />);

    const select = screen.getByRole('combobox', { name: 'Sexo' });
    expect(select).toHaveTextContent('Hembra');
    expect(select).toHaveAttribute('aria-required', 'true');
    expect(select).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens its list of options and chooses one', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SelectField label="Sexo" name="sex" value="" options={options} onChange={onChange} />);

    const select = screen.getByRole('combobox', { name: 'Sexo' });
    await user.click(select);

    expect(select).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toHaveAttribute('id', select.getAttribute('aria-controls'));

    await user.click(screen.getByRole('option', { name: 'Macho' }));
    expect(onChange).toHaveBeenCalledWith({ target: { name: 'sex', value: 'male' } });
  });

  it('takes its name from ariaLabel when it has no visible label', () => {
    render(<SelectField ariaLabel="Filtrar por" name="dimension" value="" options={options} onChange={() => {}} />);

    expect(screen.getByRole('combobox', { name: 'Filtrar por' })).toBeInTheDocument();
  });
});
