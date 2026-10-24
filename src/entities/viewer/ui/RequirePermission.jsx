import { Navigate, Outlet } from 'react-router';
import useCan from '../model/useCan';

// Child routes need any of `anyOf`; without it, back to the map (everyone can see it)
export default function RequirePermission({ anyOf }) {
  const can = useCan();

  if (!can(...anyOf)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
