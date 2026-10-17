import { useRef } from 'react';
import { Outlet } from 'react-router';
import MapTopBar from '../components/MapTopBar';

// mapRef: handle of the page's MapView; a picked search result is centered on it
export default function MapLayout() {
  const mapRef = useRef(null);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <MapTopBar onSelect={(result) => mapRef.current?.focusOn(result)} />

      <Outlet context={{ mapRef }} />
    </div>
  );
}
