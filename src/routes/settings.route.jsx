import SettingsPage from '../pages/SettingsPage';
import CowsPage from '../pages/CowsPage';
import CollarsPage from '../pages/CollarsPage';
import ZonesPage from '../pages/ZonesPage';
import GroupsPage from '../pages/GroupsPage';

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
  ]
};
