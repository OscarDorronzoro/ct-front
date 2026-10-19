// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router';

import ProtectedRoute from './ProtectedRoute';
import useAuth from '../../context/auth/useAuth';

vi.mock('../../context/auth/useAuth');

function LoginProbe() {
  const location = useLocation();
  return <div>Login (desde {location.state?.from?.pathname})</div>;
}

function renderAt(path) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<LoginProbe />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/history" element={<div>Historial</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('shows the page to a logged user', () => {
    useAuth.mockReturnValue({ user: { id: 1 }, loading: false, connectionError: null });
    renderAt('/history');

    expect(screen.getByText('Historial')).toBeInTheDocument();
  });

  it('sends a logged out user to the login, remembering the page', () => {
    useAuth.mockReturnValue({ user: null, loading: false, connectionError: null });
    renderAt('/history');

    expect(screen.getByText('Login (desde /history)')).toBeInTheDocument();
  });

  it('offers to retry when the session could not be checked, instead of the login', async () => {
    const retry = vi.fn();
    useAuth.mockReturnValue({ user: null, loading: false, connectionError: { status: 0 }, retry });
    renderAt('/history');

    expect(screen.getByText('No se pudo conectar con el servidor')).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(retry).toHaveBeenCalled();
  });
});
