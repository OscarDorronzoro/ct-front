import ContentLayout from '../layouts/ContentLayout';
import { ProfilePage } from '@/pages/profile/overview';
import { NotificationsPage } from '@/pages/profile/notifications';

// The user's own settings (every role)
export const profileRoute = {
  path: 'profile',
  element: <ContentLayout />,
  children: [
    { index: true, element: <ProfilePage /> },
    { path: 'notifications', element: <NotificationsPage /> },
  ],
};
