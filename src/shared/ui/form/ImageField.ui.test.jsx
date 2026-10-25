import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageField from './ImageField';

const image = (size = 1000, type = 'image/png') => new File([new Uint8Array(size)], 'vaca.png', { type });

function setup(props = {}) {
  const onChange = vi.fn();
  const { container } = render(<ImageField onChange={onChange} {...props} />);
  const choose = (file) => fireEvent.change(container.querySelector('input[type=file]'), { target: { files: [file] } });

  return { onChange, choose, user: userEvent.setup() };
}

describe('ImageField', () => {
  beforeEach(() => {
    // happy-dom has no object URLs
    URL.createObjectURL = vi.fn(() => 'blob:preview');
    URL.revokeObjectURL = vi.fn();
  });

  it('shows the current image', () => {
    setup({ initialImage: '/images/cows/a.webp' });

    expect(screen.getByAltText('Vista previa')).toHaveAttribute('src', `${window.location.origin}/images/cows/a.webp`);
  });

  it('removes the current image (null) and can undo it (undefined)', async () => {
    const { onChange, user } = setup({ initialImage: '/images/cows/a.webp' });

    await user.click(screen.getByRole('button', { name: 'Quitar imagen' }));

    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(screen.queryByAltText('Vista previa')).not.toBeInTheDocument();
    expect(screen.getByText(/La imagen actual se quitará al guardar/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Deshacer' }));

    expect(onChange).toHaveBeenLastCalledWith(undefined);
    expect(screen.getByAltText('Vista previa')).toBeInTheDocument();
  });

  it('sends a new image and shows its preview', () => {
    const { onChange, choose } = setup({ initialImage: '/images/cows/a.webp' });
    const file = image();

    choose(file);

    expect(onChange).toHaveBeenLastCalledWith(file);
    expect(screen.getByAltText('Vista previa')).toHaveAttribute('src', 'blob:preview');
    expect(screen.getByText(/Imagen nueva/)).toBeInTheDocument();
  });

  it('discarding a new image without a current one is no change (undefined)', async () => {
    const { onChange, choose, user } = setup();

    choose(image());
    await user.click(screen.getByRole('button', { name: 'Quitar imagen' }));

    expect(onChange).toHaveBeenLastCalledWith(undefined);
    expect(screen.queryByText(/se quitará al guardar/)).not.toBeInTheDocument();
  });

  it('rejects files over 5 MB and non-images', () => {
    const { onChange, choose } = setup();

    choose(image(6 * 1024 * 1024));
    expect(screen.getByText('La imagen no debe superar los 5 MB.')).toBeInTheDocument();

    choose(image(1000, 'application/pdf'));
    expect(screen.getByText('Seleccione un archivo de imagen válido.')).toBeInTheDocument();

    expect(onChange).not.toHaveBeenCalled();
  });
});
