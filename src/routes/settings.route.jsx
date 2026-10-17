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

import RequireRole from '../components/auth/RequiredRole';
import USER_ROLES from '../utils/userRoles'

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
      path: 'cows/new',
      element: <CowFormPage />,
    },
    {
      path: 'cows/:cowId',
      element: <CowFormPage />,
    },
    {
      path: 'collars',
      element: <CollarsPage />,
    },
    {
      path: 'collars/new',
      element: <CollarFormPage />,
    },
    {
      path: 'collars/:collarId',
      element: <CollarFormPage />,
    },
    {
      path: 'groups',
      element: <GroupsPage />,
    },
    {
      path: 'groups/new',
      element: <GroupFormPage />,
    },
    {
      path: 'groups/:groupId',
      element: <GroupFormPage />,
    },
    {
      path: 'zones',
      element: <ZonesPage />,
    },
    // Lazy: the zone editor brings terra-draw, only needed here
    {
      path: 'zones/new',
      lazy: loadZoneFormPage,
    },
    {
      path: 'zones/:zoneId',
      lazy: loadZoneFormPage,
    },
    {
      element: <RequireRole role={USER_ROLES.ADMIN} />,
      children: [
        {
          path: 'users',
          element: <UsersPage />,
        },
        {
          path: 'users/new',
          element: <UserFormPage />,
        },
        {
          path: 'users/:userId',
          element: <UserFormPage />,
        },
      ],
    },
  ]
};
