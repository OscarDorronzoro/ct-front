import { useState, useEffect } from 'react';

import { toTimeElapsed, formatDate } from '../utils/dateHelper';

import { getCow } from '../services/cow';

export default function PositionDetails({ selectedPoint, setSelectedPoint, position }) {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (!selectedPoint?.properties.cowId) {return;}

    let cancelled = false;

    //setDetails(null);

    getCow(selectedPoint.properties.cowId)
      .then((cow) => {
        if (!cancelled) {
          setDetails(cow);
        }
      })
      .catch(() => {setDetails(null)});

    return () => { cancelled = true; }

  }, [selectedPoint?.properties.cowId]);

  if (!selectedPoint || !position) {return null;}

  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, calc(-100% - 12px))',
        zIndex: 2000,

        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >

      {/* Card */}
      <div
        style={{
          background: 'rgba(20,20,20,0.6)',
          backdropFilter: 'blur(5px)',

          color: 'white',

          padding: '12px',
          borderRadius: '12px',

          minWidth: '220px',

          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        <div>
          <b>Collar:</b>{' '}
          {selectedPoint.properties.collarId}
        </div>

        <div>
          <b>Vaca:</b>{' '}
          {details?.alias
            || selectedPoint.properties.cowId
            || 'Prueba de collar'
          }
        </div>

        <div>
          <b>Fecha:</b>{' '}
          {formatDate(
            selectedPoint.properties.timestamp
          )}
        </div>

        <div style={{
          color: '#b1b1b1',
        }}>
          <i>{toTimeElapsed(selectedPoint.properties.timestamp).text}</i>
        </div>

        <div style={{
          color: selectedPoint.properties.signalStrength < 25 ? '#c50000' :
            selectedPoint.properties.signalStrength < 40 ? '#e09600' :
            selectedPoint.properties.signalStrength < 60 ? '#d4c600' :
            '#197500',
        }}>
          <i>Señal: {selectedPoint.properties.signalStrength}%</i>
        </div>

        <button
          onClick={() => setSelectedPoint(null)}
          style={{
            marginTop: '10px',
          }}
        >
          Cerrar
        </button>
      </div>

      {/* Flecha */}
      <div
        style={{
          width: 0,
          height: 0,

          borderLeft: '15px solid transparent',
          borderRight: '15px solid transparent',

          borderTop: '25px solid rgba(20,20,20,0.9)',

          marginTop: '-1px',
        }}
      />

    </div>
  );
}
