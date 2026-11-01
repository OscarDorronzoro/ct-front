import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router';
import FirmwareFormPage from './FirmwareFormPage';
import { createFirmware } from '@/entities/firmware-version';
import { ApiError } from '@/shared/api';

vi.mock('@/entities/firmware-version/api/firmwareApi');

const file = new File([new Uint8Array([0xe9, 1, 2])], 'collar.bin');

function renderForm() {
  render(
    <MemoryRouter initialEntries={['/settings/firmwares/new']}>
      <Routes>
        <Route path="/settings/firmwares/new" element={<FirmwareFormPage />} />
        <Route path="/settings/firmwares" element={<p>Lista de firmwares</p>} />
      </Routes>
    </MemoryRouter>,
  );
  return userEvent.setup();
}

async function fill(user) {
  await user.upload(screen.getByLabelText(/Archivo/), file);
  await user.type(screen.getByLabelText(/Código/), '3');
  await user.type(screen.getByLabelText(/Versión/), '1.2.0');
  await user.click(screen.getByRole('button', { name: 'Subir' }));
}

describe('FirmwareFormPage', () => {
  beforeEach(() => {
    createFirmware.mockResolvedValue(undefined);
  });

  it('uploads the file with its code and version, and goes back to the list', async () => {
    const user = renderForm();

    await fill(user);

    expect(createFirmware).toHaveBeenCalledWith({
      file, code: '3', version: '1.2.0', notes: '',
    });
    expect(await screen.findByText('Lista de firmwares')).toBeInTheDocument();
  });

  it('shows why the backend rejected it', async () => {
    createFirmware.mockRejectedValue(new ApiError('Ya existe un firmware con ese código.', 409, {}));
    const user = renderForm();

    await fill(user);

    expect(await screen.findByRole('alert')).toHaveTextContent('Ya existe un firmware con ese código.');
    expect(screen.queryByText('Lista de firmwares')).not.toBeInTheDocument();
  });
});
