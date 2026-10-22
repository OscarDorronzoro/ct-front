import SettingsPage from '../pages/SettingsPage';
import CowsPage from '../pages/CowsPage';
import CollarsPage from '../pages/CollarsPage';
import ZonesPage from '../pages/ZonesPage';
import GroupsPage from '../pages/GroupsPage';
import CowFormPage from '../pages/CowFormPage';
import CollarFormPage from '../pages/CollarFormPage';
import GroupFormPage from '../pages/GroupFormPage';
import UsersPage from '../pages/UsersPage';
import UserFormPage from '../pages/UserFormPage';

import RequirePermission from '../components/auth/RequirePermission';

const loadZoneFormPage = async () => ({
  Component: (await import('../pages/ZoneFormPage')).default,
});

export const settingsRoute = {
  path: 'settings',
  element: <SettingsPage />,
  children: [
    {
      path: 'cows',
      element: <CowsPage />,
    },
    {
      path: 'collars',
      element: <CollarsPage />,
    },
    {
      path: 'groups',
      element: <GroupsPage />,
    },
    {
      path: 'zones',
      element: <ZonesPage />,
    },
    // Forms: only for who can change something in them (the backend checks each request)
    {
      element: <RequirePermission anyOf={['cows:write']} />,
      children: [
        { path: 'cows/new', element: <CowFormPage /> },
        { path: 'groups/new', element: <GroupFormPage /> },
        { path: 'groups/:groupId', element: <GroupFormPage /> },
      ],
    },
    {
      // The technician edits only the collar of the cow
      element: <RequirePermission anyOf={['cows:write', 'cows:assignCollar']} />,
      children: [
        { path: 'cows/:cowId', element: <CowFormPage /> },
      ],
    },
    {
      element: <RequirePermission anyOf={['collars:write']} />,
      children: [
        { path: 'collars/new', element: <CollarFormPage /> },
        { path: 'collars/:collarId', element: <CollarFormPage /> },
      ],
    },
    {
      // Lazy: the zone editor brings terra-draw, only needed here
      element: <RequirePermission anyOf={['zones:write']} />,
      children: [
        { path: 'zones/new', lazy: loadZoneFormPage },
        { path: 'zones/:zoneId', lazy: loadZoneFormPage },
      ],
    },
    {
      element: <RequirePermission anyOf={['users:manage']} />,
      children: [
        { path: 'users', element: <UsersPage /> },
        { path: 'users/new', element: <UserFormPage /> },
        { path: 'users/:userId', element: <UserFormPage /> },
      ],
    },
  ]
};
