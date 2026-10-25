import {
  useEffect, useState, useMemo, useRef, useCallback, useImperativeHandle,
} from 'react';
import maplibregl from 'maplibre-gl';
import { BaseMap, useBaseMap } from '@/shared/ui/map';
import PositionSheet from './PositionSheet';
import MapControls from './MapControls';
import MapNotice from './MapNotice';
import ZoneCard from './ZoneCard';
import HistoryLegend from './HistoryLegend';
import {
  addZoneLayers, setZoneData, setZonesVisible, createZoneLabels, ZONE_FILL_LAYER,
} from '@/entities/zone';
import {
  addPositionLayers, setHeatView,
  POINTS_SOURCE, TRACKS_SOURCE, HITBOX_LAYER, HALO_LAYER,
} from '../lib/positionLayers';
import tooltipStyles from './MapTooltip.module.css';
import styles from './MapView.module.css';
import { useIsMobile } from '@/shared/lib/media';
import useZoneLayer from '../model/useZoneLayer';
import useMapLabels from '../model/useMapLabels';
import { saveMapConfig } from '@/shared/lib/map-config';
import { toTimeElapsed, formatTime } from '@/shared/lib/date';
import { formatDistance } from '@/shared/lib/geo';
import {
  groupByCollar, collarColors, tracksGeoJSON, heatWeights,
} from '../lib/mapPoints';

// Zoom used when centering on a searched cow or collar (only zooms in)
const FOCUS_ZOOM = 17;

// History: the oldest position of the range is drawn at this opacity, the newest fully opaque
const MIN_POINT_OPACITY = 0.25;

const time = (p) => new Date(p.recordedAt).getTime();

// Feature properties of a position (the map source and the selected point share them)
function pointProperties(p) {
  return {
    id: p.id,
    timestamp: time(p),
    collarId: p.collarId,
    cowId: p.cowId,
    signalStrength: p.signalStrength,
  };
}

// mode: 'live' (last position per collar, colored by freshness) or 'history' (tracks per cow,
// with a heatmap view).
// referenceTime: point ages are computed against it (end of the history range); null = now.
// ref: { focusOn(result) } centers a search result ({ type: 'cow' | 'collar', id, label }).
// focus: the same, once on load (a notification that opens the map on a cow).
export default function MapView({
  points, mode, referenceTime = null, distances = null, focus = null, ref,
}) {
  const isHistory = mode === 'history';
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [follow, setFollow] = useState(true);
  const isMobile = useIsMobile();
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [notice, setNotice] = useState(null);
  // History: 'points' (tracks) or 'heat', and collars hidden from the legend
  const [view, setView] = useState('points');
  const [hidden, setHidden] = useState(() => new Set());
  const zoneLayer = useZoneLayer();
  const zoneLabelsRef = useRef(null);
  const zonesVisibleRef = useRef(zoneLayer.visible);
  const getLabel = useMapLabels();

  const lastFollowedTimestamp = useRef(null);

  // Read by the map's hover handler, registered once on load
  const tooltipTextRef = useRef(null);
  useEffect(() => {
    tooltipTextRef.current = ({ cowId, collarId, timestamp }) => {
      const when = isHistory
        ? formatTime(timestamp)
        : toTimeElapsed(timestamp).text.toLowerCase();
      return `${getLabel({ cowId, collarId })}\u00A0· ${when}`;
    };
  });

  // Layers and handlers, once the map is loaded
  const { mapRef, ready: mapReady, handleLoad } = useBaseMap((map) => {
    // Zones below the positions
    addZoneLayers(map);
    zoneLabelsRef.current = createZoneLabels(map);

    addPositionLayers(map, { mode, isMobile });

    map.on('click', HITBOX_LAYER, (e) => {
      const feature = e.features[0];

      const coordinates = feature.geometry.coordinates.slice();
      const properties = feature.properties;
      setSelectedZoneId(null);
      setSelectedPoint({coordinates, properties});
    });

    map.on('click', (e) => {
      const features = map.queryRenderedFeatures(
        e.point,
        { layers: [HITBOX_LAYER] }
      );

      if (features.length > 0) {
        return;
      }
      setSelectedPoint(null);

      const zones = zonesVisibleRef.current
        ? map.queryRenderedFeatures(e.point, { layers: [ZONE_FILL_LAYER] })
        : [];
      setSelectedZoneId(zones[0]?.properties.id ?? null);
    });

    // Name and time on hover (mouse only: on touch screens the tap opens the details)
    const tooltip = window.matchMedia('(hover: hover)').matches
      ? new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 12,
        className: tooltipStyles.tooltip,
      })
      : null;

    map.on('mousemove', HITBOX_LAYER, (e) => {
      map.getCanvas().style.cursor = 'pointer';

      const feature = e.features[0];
      tooltip
        ?.setLngLat(feature.geometry.coordinates)
        .setText(tooltipTextRef.current(feature.properties))
        .addTo(map);
    });

    map.on('mouseleave', HITBOX_LAYER, () => {
      map.getCanvas().style.cursor = '';
      tooltip?.remove();
    });
  });

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
      time(current) > time(latest) ? current : latest
    );
  }, [latestPoints]);

  const dataPoints = isHistory ? points : latestPoints;

  const groups = useMemo(() => groupByCollar(dataPoints), [dataPoints]);
  const colors = useMemo(() => collarColors(groups.keys()), [groups]);

  const visibleGroups = useMemo(() => {
    if (!hidden.size) {return groups;}
    return new Map([...groups].filter(([collarId]) => !hidden.has(collarId)));
  }, [groups, hidden]);

  // History: distance traveled by each collar in the range, indexed by collar
  const metersByCollar = useMemo(
    () => new Map((distances ?? []).map(({ collarId, meters }) => [collarId, meters])),
    [distances],
  );

  const legendItems = useMemo(() => [...groups]
    .sort(([a], [b]) => a - b)
    .map(([collarId, list]) => ({
      collarId,
      color: colors.get(collarId),
      label: getLabel(list[list.length - 1]),
      detail: metersByCollar.has(collarId) ? formatDistance(metersByCollar.get(collarId)) : null,
    })), [groups, colors, getLabel, metersByCollar]);

  const selectedId = selectedPoint?.properties?.id;

  // Positions and tracks
  useEffect(() => {
    if (!mapReady || !mapRef.current) {return;}

    const map = mapRef.current;
    const now = referenceTime ? referenceTime.getTime() : Date.now();
    const weights = isHistory ? heatWeights(visibleGroups) : null;

    let oldest = now;
    visibleGroups.forEach((list) => { oldest = Math.min(oldest, time(list[0])); });
    const span = Math.max(now - oldest, 1);

    const features = [];
    visibleGroups.forEach((list) => {
      list.forEach((p, i) => {
        const t = time(p);

        features.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [p.location.longitude, p.location.latitude] },
          properties: {
            ...pointProperties(p),
            ageMinutes: (now - t) / 60000,
            color: colors.get(p.collarId),
            opacity: 1 - (1 - MIN_POINT_OPACITY) * Math.min((now - t) / span, 1),
            isLast: i === list.length - 1,
            selected: p.id === selectedId,
            weight: weights?.get(p.id) ?? 0,
          },
        });
      });
    });

    // Newer positions drawn on top of older ones
    features.sort((a, b) => a.properties.timestamp - b.properties.timestamp);

    map.getSource(POINTS_SOURCE).setData({ type: 'FeatureCollection', features });

    if (isHistory) {
      map.getSource(TRACKS_SOURCE).setData(tracksGeoJSON(visibleGroups, colors));
    }
  }, [mapReady, visibleGroups, colors, selectedId, referenceTime, isHistory, mapRef]);

  // History: tracks or heatmap
  useEffect(() => {
    if (!mapReady || !mapRef.current || !isHistory) {return;}

    setHeatView(mapRef.current, view === 'heat');
  }, [mapReady, isHistory, view, mapRef]);

  // Pulsing halo on collars that transmitted recently (live). ~20 fps is enough for a smooth pulse.
  useEffect(() => {
    if (!mapReady || !mapRef.current || isHistory) {return;}

    const map = mapRef.current;
    let frame;
    let last = 0;
    const PERIOD = 1600;

    const animate = (now) => {
      frame = requestAnimationFrame(animate);
      if (now - last < 50 || !map.getLayer(HALO_LAYER)) {return;}
      last = now;

      const t = (now % PERIOD) / PERIOD;
      map.setPaintProperty(HALO_LAYER, 'circle-radius', 10 + t * 14);
      map.setPaintProperty(HALO_LAYER, 'circle-opacity', 0.55 * (1 - t));
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [mapReady, isHistory, mapRef]);

  // Zones: data, labels and visibility
  useEffect(() => {
    zonesVisibleRef.current = zoneLayer.visible;

    if (!mapReady || !mapRef.current) {return;}

    const map = mapRef.current;
    const selected = zoneLayer.visible ? selectedZoneId : null;
    const geojson = {
      ...zoneLayer.geojson,
      features: zoneLayer.geojson.features.map((f) => ({
        ...f,
        properties: { ...f.properties, selected: f.properties.id === selected },
      })),
    };

    setZoneData(map, geojson);
    setZonesVisible(map, zoneLayer.visible);
    zoneLabelsRef.current?.update(geojson, zoneLayer.visible);
  }, [mapReady, zoneLayer.geojson, zoneLayer.visible, selectedZoneId, mapRef]);

  useEffect(() => () => zoneLabelsRef.current?.remove(), []);

  useEffect(() => {
    if (!mapReady || !mapRef.current) {return;}

    const map = mapRef.current;

    // Only user gestures (originalEvent), not our own easeTo/fitBounds
    const disableFollow = (e) => {
      if (e.originalEvent) {
        setFollow(false);
      }
    };

    map.on('dragstart', disableFollow);
    map.on('zoomstart', disableFollow);
    map.on('rotatestart', disableFollow);

    return () => {
      map.off('dragstart', disableFollow);
      map.off('zoomstart', disableFollow);
      map.off('rotatestart', disableFollow);
    };
  }, [mapReady, mapRef]);

  useEffect(() => {
    if (!latestPoint) {return;}
    if (!follow) {return;}
    if (!mapReady) {return;}
    if (!mapRef.current) {return;}

    const timestamp = time(latestPoint);

    // no hay datos nuevos reales
    if (lastFollowedTimestamp.current === timestamp) {
      return;
    }

    lastFollowedTimestamp.current = timestamp;

    const center = [latestPoint.location.longitude, latestPoint.location.latitude];

    mapRef.current.easeTo({
      center,
      duration: 500,
    });

    saveMapConfig({ center, zoom: mapRef.current.getZoom() });

  }, [latestPoint, follow, mapReady, mapRef]);

  const showCollar = useCallback((collarId) => {
    setHidden((current) => {
      if (!current.has(collarId)) {return current;}
      const next = new Set(current);
      next.delete(collarId);
      return next;
    });
  }, []);

  const toggleCollar = (collarId) => {
    if (hidden.has(collarId)) {
      showCollar(collarId);
      return;
    }

    setHidden((current) => new Set(current).add(collarId));

    if (selectedPoint?.properties.collarId === collarId) {
      setSelectedPoint(null);
    }
  };

  // Center a cow or collar on its latest visible position and open its details
  const focusOnTarget = useCallback((focus) => {
    const map = mapRef.current;
    if (!map) {return;}

    const key = focus.type === 'cow' ? 'cowId' : 'collarId';
    const latest = dataPoints
      .filter((p) => p[key] === focus.id)
      .reduce((a, b) => (!a || time(b) > time(a) ? b : a), null);

    if (!latest) {
      setSelectedPoint(null);
      setNotice({
        id: Date.now(),
        text: `${focus.label}: sin posiciones ${isHistory ? 'en este rango' : 'recientes'}`,
      });
      return;
    }

    const coordinates = [latest.location.longitude, latest.location.latitude];
    const height = map.getContainer().clientHeight;

    showCollar(latest.collarId);
    setNotice(null);
    setFollow(false);
    setSelectedZoneId(null);
    setSelectedPoint({ coordinates, properties: pointProperties(latest) });

    map.easeTo({
      center: coordinates,
      zoom: Math.max(map.getZoom(), FOCUS_ZOOM),
      // Mobile: leave the point above the bottom sheet (at 30% of the height)
      offset: isMobile ? [0, -height * 0.2] : [0, 0],
      duration: 600,
    });
  }, [dataPoints, isHistory, isMobile, mapRef, showCollar]);

  // Search result: from the top bar
  useImperativeHandle(ref, () => ({ focusOn: focusOnTarget }), [focusOnTarget]);

  // `focus` prop (a notification opened the map on a cow): once the map and the positions are ready
  const focusedRef = useRef(null);
  useEffect(() => {
    const key = focus && `${focus.type}-${focus.id}`;
    if (!key || focusedRef.current === key || !mapReady || dataPoints.length === 0) {return undefined;}

    // Next frame: the map has drawn the points
    const frame = requestAnimationFrame(() => {
      focusedRef.current = key;
      focusOnTarget(focus);
    });
    return () => cancelAnimationFrame(frame);
  }, [focus, mapReady, dataPoints, focusOnTarget]);

  const closeNotice = useCallback(() => setNotice(null), []);

  // Mobile: the bottom sheet covers the lower half, keep the point above it.
  // Skipped while the map is easing (a search result already placed it).
  useEffect(() => {
    if (!selectedPoint || !mapRef.current || !isMobile) {return;}
    if (mapRef.current.isMoving()) {return;}

    const map = mapRef.current;
    const { y } = map.project(selectedPoint.coordinates);
    const height = map.getContainer().clientHeight;

    if (y > height * 0.4) {
      map.panBy([0, y - height * 0.3], { duration: 300 });
    }
  }, [selectedPoint, isMobile, mapRef]);

  const centerOnCows = () => {
    const map = mapRef.current;
    const visible = latestPoints.filter((p) => !hidden.has(p.collarId));
    if (!map || !visible.length) {return;}

    lastFollowedTimestamp.current = null;
    setFollow(true);

    if (visible.length === 1) {
      const p = visible[0];
      map.easeTo({ center: [p.location.longitude, p.location.latitude], duration: 500 });
      return;
    }

    const lons = visible.map((p) => p.location.longitude);
    const lats = visible.map((p) => p.location.latitude);
    map.fitBounds(
      [[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]],
      { padding: 80, maxZoom: 17, duration: 500 },
    );
  };

  const selectedZone = zoneLayer.visible && selectedZoneId
    ? zoneLayer.zonesById.get(selectedZoneId)
    : null;

  return (
    <div className={styles.view}>
      {isHistory && legendItems.length > 0 &&
        <HistoryLegend
          view={view}
          onViewChange={setView}
          items={legendItems}
          hidden={hidden}
          onToggle={toggleCollar}
        />
      }
      {notice && !selectedPoint &&
        <MapNotice key={notice.id} onClose={closeNotice}>{notice.text}</MapNotice>
      }
      {selectedPoint &&
        <PositionSheet
          key={selectedPoint.properties.id}
          point={selectedPoint}
          onClose={() => setSelectedPoint(null)}
        />
      }
      <MapControls
        hiddenOnMobile={!!selectedPoint || !!selectedZone}
        onZoomIn={() => mapRef.current?.zoomIn()}
        onZoomOut={() => mapRef.current?.zoomOut()}
        onCenter={centerOnCows}
        zonesVisible={zoneLayer.visible}
        onToggleZones={zoneLayer.toggleVisible}
      />
      {selectedZone && !selectedPoint &&
        <ZoneCard
          zone={selectedZone}
          typeName={zoneLayer.typeNames.get(selectedZone.zoneTypeId)}
          onClose={() => setSelectedZoneId(null)}
        />
      }
      <BaseMap onLoad={handleLoad} />
    </div>
  );
}
