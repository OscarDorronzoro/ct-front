import { createBrowserRouter } from 'react-router';

import App from '../App';
import { indexRoute } from './index.route'
import { historyRoute } from './history.route'
import { settingsRoute } from './settings.route'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      indexRoute,
      historyRoute,
      settingsRoute,
    ],
  },
]);
