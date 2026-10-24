import useAuth from './useAuth';
import { can } from './permissions';

// can('cows:write') for the logged user; several permissions: any of them
export default function useCan() {
  const { user } = useAuth();
  return (...permissions) => can(user, ...permissions);
}
