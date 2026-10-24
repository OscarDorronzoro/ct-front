import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter';
import './styles/index.css'
import 'maplibre-gl/dist/maplibre-gl.css';
import { RouterProvider } from 'react-router';
import { router } from './routes/router';
import { AuthProvider } from '@/entities/viewer';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)

