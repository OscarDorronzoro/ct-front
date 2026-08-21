import { Navigate, Outlet } from 'react-router';

import useAuth from '../../context/auth/useAuth';

export default function RequireRole({ role }) {
  const { user } = useAuth();

  if (user?.role > role) {
    return <Navigate to="/settings/cows" replace />;
  }

  return <Outlet />;
}
