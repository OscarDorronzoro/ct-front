import { createBrowserRouter } from 'react-router';
import RootLayout from '../layouts/RootLayout';
import ProtectedRoute from './ProtectedRoute';
import { mapRoute } from './map.route';
import { settingsRoute } from './settings.route';
import { loginRoute } from './login.route';
import { analyticsRoute } from './analytics.route';
import { ErrorPage } from '@/pages/error';
import LoadingScreen from './LoadingScreen';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    hydrateFallbackElement: <LoadingScreen />,
    children: [

      // Public
      loginRoute,

      // Authenticated
      {
        element: <ProtectedRoute />,
        children: [
          mapRoute,
          settingsRoute,
          analyticsRoute,
        ],
      },

    ],
  },
]);
