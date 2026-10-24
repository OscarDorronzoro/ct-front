import SettingsLayout from '../layouts/SettingsLayout';
import { CowsPage } from '@/pages/settings/cows/list';
import { CollarsPage } from '@/pages/settings/collars/list';
import { ZonesPage } from '@/pages/settings/zones/list';
import { GroupsPage } from '@/pages/settings/groups/list';
import { CowFormPage } from '@/pages/settings/cows/form';
import { CollarFormPage } from '@/pages/settings/collars/form';
import { GroupFormPage } from '@/pages/settings/groups/form';
import { UsersPage } from '@/pages/settings/users/list';
import { UserFormPage } from '@/pages/settings/users/form';
import { CowDetailPage } from '@/pages/settings/cows/detail';
import { HealthEventFormPage } from '@/pages/settings/cows/new-event';
import { ProductsPage } from '@/pages/settings/products/list';
import { ProductFormPage } from '@/pages/settings/products/form';
import { RequirePermission } from '@/entities/viewer';

const loadZoneFormPage = async () => ({
  Component: (await import('@/pages/settings/zones/form')).ZoneFormPage,
});

export const settingsRoute = {
  path: 'settings',
  element: <SettingsLayout />,
  children: [
    {
      path: 'cows',
      element: <CowsPage />,
    },
    // Card of the cow, with its clinical history for who can read it
    {
      path: 'cows/:cowId',
      element: <CowDetailPage />,
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
        { path: 'cows/:cowId/edit', element: <CowFormPage /> },
      ],
    },
    {
      element: <RequirePermission anyOf={['health:read']} />,
      children: [
        { path: 'products', element: <ProductsPage /> },
      ],
    },
    {
      element: <RequirePermission anyOf={['health:write']} />,
      children: [
        { path: 'cows/:cowId/events/new', element: <HealthEventFormPage /> },
        { path: 'products/new', element: <ProductFormPage /> },
        { path: 'products/:productId', element: <ProductFormPage /> },
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
