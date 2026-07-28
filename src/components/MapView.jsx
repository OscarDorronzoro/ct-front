
import { useEffect, useState, useMemo, useRef } from 'react';
//import maplibregl from 'maplibre-gl';

import BaseMap from './BaseMap';
import PositionDetails from './PositionDetails';
import useIsMobile from '../hooks/useIsMobile';

function getCollarColor(id) {
  const colors = [
    '#ef7979',
    '#1aff00',
    '#1a8fe3',
    '#ffe66d',
    '#fd9c13',
    '#ff0000',
    '#08520a',
    '#cf1bee',
    '#619381',
  ];

  return colors[id % colors.length];
}

export default function MapView({ points, mode }) {
  const [mapReady, setMapReady] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [follow, setFollow] = useState(true);
  const isMobile = useIsMobile();
  const [popupPosition, setPopupPosition] = useState(null);
  const [mapConfig] = useState(() => {
    const saved = localStorage.getItem('mapConfig');
    if (saved) {
      return JSON.parse(saved);
    }

    return {
      center: [-61.209824, -32.967354],
      zoom: 14,
    };
  });

  const mapRef = useRef(null);
  const lastFollowedTimestamp = useRef(null);
  const selectedPointRef = useRef(null);

  const circleRadiusBase = 6;
  const circleStrokeWith = 4;

  const updatePopupPosition = () => {
    const point = selectedPointRef.current;
    if (!mapRef.current || !point) {return;}

    const p = mapRef.current.project(point.coordinates);

    setPopupPosition({
      x: p.x,
      y: p.y,
    });
  };

  const latestPoints = useMemo(() => {
    const map = {};
    points.forEach(p => {
      if (!map[p.collarId] || map[p.collarId].recordedAt < p.recordedAt) {
        map[p.collarId] = p;
      }
    });
    return Object.values(map);
  }, [points]);

  const latestPoint = useMemo(() => {
    if (!latestPoints.length) {return null;}

    return latestPoints.reduce((latest, current) =>
      new Date(current.recordedAt).getTime() >
      new Date(latest.recordedAt).getTime()
        ? current
        : latest
    );
  }, [latestPoints]);

  const dataPoints = useMemo(() => {
    return mode === 'live' ? latestPoints : points;
  }, [mode, latestPoints, points]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !dataPoints) {return;}

    const map = mapRef.current;

    const now = Date.now();

    const geojson = {
      type: 'FeatureCollection',
      features: dataPoints.map(p => {
        const ageMinutes = (now - new Date(p.recordedAt).getTime()) / 1000 / 60;
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [p.location.longitude, p.location.latitude],
          },
          properties: {
            id: p.id,
            timestamp: new Date(p.recordedAt).getTime(),
            collarId: p.collarId,
            cowId: p.cowId,
            ageMinutes,
            collarColor: getCollarColor(p.collarId),
            selected: selectedPoint?.properties?.id === p.id,
            signalStrength: p.signalStrength,
          },
        };
      }),
    };

    if (map.getSource('points')) {
      map.getSource('points').setData(geojson);
    } else {
      map.addSource('points', {
        type: 'geojson',
        data: geojson,
      });


      if (map.getLayer('points-layer')) {
        map.setPaintProperty(
          'points-layer',
          'circle-color',
          [
            'interpolate',
            ['linear'],
            ['get', 'ageMinutes'],

            0, '#ff0000',     // recién llegado
            7, '#df3a3a',     // 7 min
            60, '#da7b45',    // 35 min
            300, '#ecc56c',    // 60 min
            480, '#717171',   // viejo
          ]
        );
      }

    }
  }, [mapReady, dataPoints, selectedPoint?.properties?.id]);

  // Blinking
  useEffect(() => {
    if (!mapReady || !mapRef.current) {return;}

    const map = mapRef.current;
    let opacity = 1;

    if (mode !== 'live') {
      map.setPaintProperty('points-layer', 'circle-opacity', opacity);
      return;
    }

    const interval = setInterval(() => {
      if (!map.getLayer('points-layer')) {return;}

      opacity = opacity === 1 ? 0.3 : 1;

      map.setPaintProperty('points-layer', 'circle-opacity', opacity);
    }, 500);

    return () => clearInterval(interval);
  }, [mapReady, mode]);

  useEffect(() => {
    if (!mapRef.current) {return;}

    const map = mapRef.current;

    const disableFollow = () => setFollow(false);

    map.on('dragstart', disableFollow);
    map.on('zoomstart', disableFollow);
    map.on('rotatestart', disableFollow);

    return () => {
      map.off('dragstart', disableFollow);
      map.off('zoomstart', disableFollow);
      map.off('rotatestart', disableFollow);
    };
  }, []);

  useEffect(() => {
    if (!latestPoint) {return;}
    if (!follow) {return;}
    if (!mapReady) {return;}
    if (!mapRef.current) {return;}

    const timestamp = new Date(latestPoint.recordedAt).getTime();

    // no hay datos nuevos reales
    if (lastFollowedTimestamp.current === timestamp) {
      return;
    }

    lastFollowedTimestamp.current = timestamp;

    // Si el punto nuevo esta dentro de lo visible, no mover
    const bounds = mapRef.current.getBounds();
    const center = [latestPoint.location.longitude, latestPoint.location.latitude];

    if (bounds.contains(center)) {
      //return;
    }

    mapRef.current.easeTo({
      center,
      duration: 500,
    });

    localStorage.setItem(
      'mapConfig',
      JSON.stringify({
        center,
        zoom: mapRef.current.getZoom(),
      })
    );

  }, [latestPoint, follow, mapReady]);

  useEffect(() => {
    selectedPointRef.current = selectedPoint;
  }, [selectedPoint]);

  useEffect(() => {
    if (!selectedPoint || !mapRef.current) {return;}

    const p = mapRef.current.project(
      selectedPoint.coordinates
    );

    setPopupPosition({
      x: p.x,
      y: p.y,
    });

  }, [selectedPoint]);


  let paint = {
    'circle-radius': [
      'case',
        ['get', 'selected'],
        10,
        circleRadiusBase,
    ],

    // interior
    'circle-color': [
      'case',
        ['get', 'selected'],
        '#afccff',

      ['<', ['get', 'ageMinutes'], 40],
        '#ff0000', // reciente
        '#777777' // viejo
    ],

    // borde
    'circle-stroke-width': circleStrokeWith,

    'circle-stroke-color': [
      'interpolate',
      ['linear'],
      ['get', 'ageMinutes'],

        0,    '#ff0000',
        20,   '#ff8800',
        120,  '#ffff00',
        480,  '#91ff00',
        1200, '#717171',
        4000, '#202020',
    ],
  }
  if (mode === 'history') {
    paint = {
      'circle-radius': [
        'case',
          ['get', 'selected'],
          10,
          circleRadiusBase,
      ],
      'circle-color': [
        'case',
        ['get', 'selected'],
        '#afccff',
        ['get', 'collarColor'],
      ],

      // borde
      'circle-stroke-width': circleStrokeWith,
      'circle-stroke-color': [
        'interpolate',
        ['linear'],
        ['get', 'ageMinutes'],

          0,    '#ff0000',
          20,   '#ff8800',
          120,  '#ffff00',
          480,  '#91ff00',
          1200, '#717171',
          4000, '#202020',
      ],
    }
  }

  return (
    <div style={{ height: '100%' }}>
      {selectedPoint &&
        <PositionDetails
          selectedPoint={selectedPoint}
          setSelectedPoint={setSelectedPoint}
          position={popupPosition}
        />
      }
      <BaseMap
        configs={mapConfig}
        onLoad={ (map) => {
          mapRef.current = map;

          // inicializar source vacío
          map.addSource('points', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [],
            },
          });

          // Layer for touch screens
          map.addLayer({
            id: 'points-hitbox-layer',
            type: 'circle',
            source: 'points',

            paint: {
              'circle-radius': isMobile ? 20 : circleRadiusBase + circleStrokeWith,
              'circle-opacity': 0,
            },
          });

          map.addLayer({
            id: 'points-layer',
            type: 'circle',
            source: 'points',
            paint: paint,
          });


          // Event listeners
          map.on('click', 'points-hitbox-layer', (e) => {
            // if (popup) {popup.remove();}
            const feature = e.features[0];

            const coordinates = feature.geometry.coordinates.slice();
            const properties = feature.properties;
            setSelectedPoint({coordinates, properties});
          });

          map.on('click', (e) => {
            const features = map.queryRenderedFeatures(
              e.point,
              { layers: ['points-hitbox-layer'] }
            );

            if (features.length > 0) {
              return;
            }
            setSelectedPoint(null);
            setPopupPosition(null);
          });

          map.on('mouseenter', 'points-hitbox-layer', () => {
            map.getCanvas().style.cursor = 'pointer';
          });

          map.on('mouseleave', 'points-hitbox-layer', () => {
            map.getCanvas().style.cursor = '';
          });

          map.on('move', updatePopupPosition);
          //map.on('zoom', updatePopupPosition); // zoom event fires move

          setMapReady(true);
        }}
      />
    </div>
  );
}
