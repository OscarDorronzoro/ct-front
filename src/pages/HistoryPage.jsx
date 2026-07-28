import { useState, useEffect } from 'react';

import { toInputFormat } from '../utils/dateHelper';
import MapView from '../components/MapView';
import { getPosition } from '../services/api';
import useIsMobile from '../hooks/useIsMobile';

export default function HistoryPage() {
  const [points, setPoints] = useState([]);
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
      if (d.getHours() < 4) {
      d.setDate(d.getDate() - 1);
      d.setHours(21);
    } else {
      d.setHours(0, 0, 0, 0);
    }

    return d;
  });
  const [dateTo, setDateTo] = useState(new Date());
  const isMobile = useIsMobile();
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (!isLive) {return;}

    const id = setInterval(() => {
      setDateTo(new Date());
    }, 1000);

    return () => clearInterval(id);
  }, [isLive]);

  // Manual mode fetch
  useEffect(() => {
    if (isLive) {return;}

    getPosition({
      dateFrom: dateFrom.toISOString(),
      dateTo: dateTo.toISOString(),
    }).then(setPoints);

  }, [dateFrom, dateTo, isLive]);

  // Live mode polling
  useEffect(() => {
    if (!isLive) {return;}

    const fetchData = () => {
      getPosition({
        dateFrom: dateFrom.toISOString(),
        dateTo: new Date().toISOString(), // SIEMPRE now
      }).then(setPoints);
    };

    fetchData();

    const id = setInterval(fetchData, 30000);

    return () => clearInterval(id);
  }, [isLive, dateFrom]);

  return (
    <div style={{
      backgroundColor: '#b07d62',
      height: '100%',
      width: '100%',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute',
        top: isMobile ? undefined : 10,
        bottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : undefined,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        padding: '10px',
        borderRadius: '8px',
        color: 'white',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '8px',
        pointerEvents: 'auto',
        background: 'rgba(20,20,20,0.4)',
        backdropFilter: 'blur(5px)',
        border: '1px solid rgba(255,255,255,0.2)',
      }}>
        <input
          type="datetime-local"
          value={toInputFormat(dateFrom)}
          onChange={(e) => setDateFrom(new Date(e.target.value))}
        />

        <input
          type="datetime-local"
          value={toInputFormat(dateTo)}
          onChange={(e) => {
            setIsLive(false);
            setDateTo(new Date(e.target.value))
          }}
        />

        <button onClick={() => setIsLive(v => !v)}>
          {isLive ? 'manual' : 'auto'}
        </button>
      </div>

      <MapView points={points} mode='history' />

    </div>
  );
}
