import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileField from './FileField';

const fileOf = (bytes) => new File([new Uint8Array(bytes)], 'collar.bin');

describe('FileField', () => {
  it('gives the chosen file', async () => {
    const onChange = vi.fn();
    render(<FileField label="Archivo" name="file" onChange={onChange} hint="Un binario" />);
    const file = fileOf(10);

    await userEvent.upload(screen.getByLabelText('Archivo'), file);

    expect(onChange).toHaveBeenCalledWith(file);
    expect(screen.getByText('Un binario')).toBeInTheDocument();
  });

  it('rejects a file over the limit', async () => {
    const onChange = vi.fn();
    render(<FileField label="Archivo" name="file" maxSize={1024 * 1024} onChange={onChange} />);

    await userEvent.upload(screen.getByLabelText('Archivo'), fileOf(1024 * 1024 + 1));

    expect(onChange).toHaveBeenCalledWith(null);
    expect(screen.getByText('El archivo no debe superar los 1 MB.')).toBeInTheDocument();
  });
});
