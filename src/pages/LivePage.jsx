import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router';

import MapView from '../components/MapView';
import { getLatestPositions } from '../services/position';
import logger from '../utils/logger';

const POLL_MS = 30000;

// Last known position of each collar, even if it stopped transmitting hours ago
export default function LivePage() {
  const [points, setPoints] = useState([]);
  const { mapRef } = useOutletContext();

  useEffect(() => {
    let cancelled = false;

    const fetchData = () => {
      getLatestPositions()
        .then((data) => {
          if (!cancelled) {
            setPoints(data);
          }
        })
        .catch((err) => logger.error('Error loading positions', err));
    };

    fetchData();
    const timerId = setInterval(fetchData, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(timerId);
    };
  }, []);

  return (
    <div style={{
      backgroundColor: '#b07d62',
      height: '100%',
      width: '100%',
    }}>
      <MapView points={points} mode="live" ref={mapRef} />
    </div>
  );
}
