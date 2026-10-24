// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router';
import LoginPage from './LoginPage';
import { useAuth } from '@/entities/viewer';

vi.mock('@/entities/viewer/model/useAuth');

function renderLogin(state) {
  render(
    <MemoryRouter initialEntries={[{ pathname: '/login', state }]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<div>Mapa en vivo</div>} />
        <Route path="/history" element={<div>Historial</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  it('redirects a logged user to the map', () => {
    useAuth.mockReturnValue({ user: { id: 1 }, loading: false, login: vi.fn() });
    renderLogin();

    expect(screen.getByText('Mapa en vivo')).toBeInTheDocument();
  });

  it('goes back to the requested page after logging in', async () => {
    const login = vi.fn().mockResolvedValue({ id: 1 });
    useAuth.mockReturnValue({ user: null, loading: false, login });
    renderLogin({ from: { pathname: '/history' } });
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/Usuario/), 'admin');
    await user.type(screen.getByLabelText(/Contraseña/), 'secreto');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(login).toHaveBeenCalledWith({ username: 'admin', password: 'secreto' });
    expect(await screen.findByText('Historial')).toBeInTheDocument();
  });
});
