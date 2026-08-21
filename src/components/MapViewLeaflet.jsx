import { MapContainer, TileLayer, Marker, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useMemo } from 'react';
import { getLocation } from '../services/position';

// Fix íconos (Leaflet bug típico con Vite/React)
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapView() {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    getLocation()
      .then(setPoints);
  }, []);

  const lastPoint = useMemo(() => {
    if (!points || points.length === 0) {return null;}
    return points[points.length - 1];
  }, [points]);

  return (
    <MapContainer
      center={lastPoint ? [lastPoint.latitude, lastPoint.longitude] : [-32.967354, -61.209824]}
      zoom={16}
      maxZoom={22}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        attribution="© Esri"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        maxZoom={22}
        maxNativeZoom={18}
      />

      {
        points.map(p => {
          const isLast = lastPoint && p.id === lastPoint.id;

          return (
            <CircleMarker
              key={p.id}
              center={[p.latitude, p.longitude]}
              radius={isLast ? 5 : 4}
              pathOptions={{
                color: isLast ? 'red' : '#00b7ff',
                fillColor: isLast ? 'red' : '#00b7ff',
                fillOpacity: isLast ? 0.9 : 0.5,
              }}
            >
              <Popup>
                {`RSSI: ${p.rssi} | SNR: ${p.snr} | ${new Date(p.recordedAt).toLocaleString()}`}
              </Popup>
            </CircleMarker>
          )
        })
      }
    </MapContainer>
  );
}
