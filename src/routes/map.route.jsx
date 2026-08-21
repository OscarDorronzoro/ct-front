import MapLayout from '../layouts/MapLayout';
import LivePage from '../pages/LivePage';
import HistoryPage from '../pages/HistoryPage';

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
