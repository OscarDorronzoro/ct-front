import { Navigate, Outlet, useLocation } from 'react-router';
import useAuth from '@/context/auth/useAuth';
import ConnectionError from './ConnectionError';

export default function ProtectedRoute() {
  const { user, loading, connectionError, retry } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  // The session couldn't be checked: offer to retry instead of asking to log in again
  if (!user && connectionError) {
    return <ConnectionError onRetry={retry} />;
  }

  if (!user) {
    // After logging in, come back to the page that was requested
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
