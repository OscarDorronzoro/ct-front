import MapLayout from '../layouts/MapLayout';
import { LivePage } from '@/pages/live';
import { HistoryPage } from '@/pages/history';

export const mapRoute = {
  element: <MapLayout />,
  children: [
    {
      index: true,
      element: <LivePage />,
    },
    {
      path: 'history',
      element: <HistoryPage />,
    },
  ],
};
