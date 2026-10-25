import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormField from './FormField';

describe('FormField', () => {
  it('links the label to the input', () => {
    render(<FormField label="Alias" name="alias" value="Ángela" onChange={() => {}} />);

    expect(screen.getByLabelText('Alias')).toHaveValue('Ángela');
  });

  it('shows and hides a password', async () => {
    const user = userEvent.setup();
    render(<FormField label="Contraseña" name="password" type="password" value="secreto" onChange={() => {}} />);
    const input = screen.getByLabelText('Contraseña');

    expect(input).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'Ocultar contraseña' }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('has no toggle for other fields', () => {
    render(<FormField label="Alias" name="alias" value="" onChange={() => {}} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
