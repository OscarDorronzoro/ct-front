import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'maplibre-gl/dist/maplibre-gl.css';

import { RouterProvider } from 'react-router';
import { router } from './routes/router';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

