import { useRef } from 'react';
import { Outlet } from 'react-router';
import { MapTopBar } from '@/widgets/map-top-bar';
import styles from './Layouts.module.css';

// mapRef: handle of the page's MapView; a picked search result is centered on it
export default function MapLayout() {
  const mapRef = useRef(null);

  return (
    <div className={styles.map}>
      <MapTopBar onSelect={(result) => mapRef.current?.focusOn(result)} />

      <Outlet context={{ mapRef }} />
    </div>
  );
}
