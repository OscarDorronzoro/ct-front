import {
  Radio, History, SatelliteDish, Users, LandPlot, UserRound, FlaskConical,
} from 'lucide-react';

import CowIcon from '../icons/CowIcon';
import { can } from '../../utils/permissions';

export const MAP_ITEMS = [
  { to: '/', end: true, label: 'En vivo', icon: Radio },
  { to: '/history', label: 'Historial', icon: History },
];

export const SETTINGS_ITEMS = [
  { to: '/settings/cows', label: 'Vacas', icon: CowIcon },
  { to: '/settings/collars', label: 'Collares', icon: SatelliteDish },
  { to: '/settings/groups', label: 'Grupos', icon: Users },
  { to: '/settings/zones', label: 'Zonas', icon: LandPlot },
  { to: '/settings/products', label: 'Productos', icon: FlaskConical, permission: 'health:read' },
  { to: '/settings/users', label: 'Usuarios', icon: UserRound, permission: 'users:manage' },
];

export function visibleItems(items, user) {
  return items.filter(item => !item.permission || can(user, item.permission));
}
