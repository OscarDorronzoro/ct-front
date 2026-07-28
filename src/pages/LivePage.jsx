import { useState, useEffect } from 'react';

import MapView from '../components/MapView';
import { getPosition } from '../services/api';

export default function LivePage() {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      const now = new Date();
      const from = new Date(now.getTime() - 1000 * 60 * 60 * 2); // últimos 60 min

      getPosition({
        dateFrom: from.toISOString(),
        dateTo: now.toISOString(),
      }).then(setPoints);
    };

    fetchData(); // primer fetch inmediato

    const timerId = setInterval(fetchData, 30000);

    return () => clearInterval(timerId);
  }, []);

  return (
    <div style={{
      backgroundColor: '#b07d62',
      height: '100%',
      width: '100%',
    }}>
      <MapView points={points} mode="live"/>
    </div>
  );
}
