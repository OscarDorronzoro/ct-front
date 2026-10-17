import {
  Radio, History, SatelliteDish, Users, LandPlot, UserRound,
} from 'lucide-react';

import CowIcon from '../icons/CowIcon';
import USER_ROLES from '../../utils/userRoles';

export const MAP_ITEMS = [
  { to: '/', end: true, label: 'En vivo', icon: Radio },
  { to: '/history', label: 'Historial', icon: History },
];

export const SETTINGS_ITEMS = [
  { to: '/settings/cows', label: 'Vacas', icon: CowIcon },
  { to: '/settings/collars', label: 'Collares', icon: SatelliteDish },
  { to: '/settings/groups', label: 'Grupos', icon: Users },
  { to: '/settings/zones', label: 'Zonas', icon: LandPlot },
  { to: '/settings/users', label: 'Usuarios', icon: UserRound, maxRole: USER_ROLES.ADMIN },
];

export function visibleItems(items, user) {
  return items.filter(item => item.maxRole === undefined || user?.role <= item.maxRole);
}
