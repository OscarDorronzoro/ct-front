import { Outlet } from 'react-router';
import MapTopBar from '../components/MapTopBar';

export default function MapLayout() {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <MapTopBar />

      <Outlet />
    </div>
  );
}
