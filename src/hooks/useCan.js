import useAuth from '../context/auth/useAuth';
import { can } from '../utils/permissions';

// can('cows:write') for the logged user; several permissions: any of them
export default function useCan() {
  const { user } = useAuth();
  return (...permissions) => can(user, ...permissions);
}
