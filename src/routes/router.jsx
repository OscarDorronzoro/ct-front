import { createBrowserRouter } from 'react-router';

import App from '../App';
import ProtectedRoute from '../components/auth/ProtectedRoute';

import { mapRoute } from './map.route'
import { settingsRoute } from './settings.route'
import { loginRoute } from './login.route';
import ErrorPage from '../pages/ErrorPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [

      // Public
      loginRoute,

      // Authenticated
      {
        element: <ProtectedRoute />,
        children: [
          mapRoute,
          settingsRoute,
        ],
      },

    ],
  },
]);
