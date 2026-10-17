import { useCallback, useEffect, useRef, useState } from 'react';
import {
  TerraDraw,
  TerraDrawPolygonMode,
  TerraDrawSelectMode,
  TerraDrawModeUndoRedo,
  TerraDrawSessionUndoRedo,
  ValidateNotSelfIntersecting,
} from 'terra-draw';
import { TerraDrawMapLibreGLAdapter } from 'terra-draw-maplibre-gl-adapter';
import { Pencil, Undo2, RotateCcw } from 'lucide-react';

import BaseMap from '../BaseMap';
import Button from '../ui/Button';
import { addZoneLayers, setZoneData } from '../map/zoneLayers';
import { closeRing, openRing, ringsBounds } from '../../utils/geo';
import { getSavedMapConfig } from '../../utils/mapConfig';
import styles from './ZoneDrawMap.module.css';

const SELECT_MODE = 'select';
const POLYGON_MODE = 'polygon';

const notSelfIntersecting = (feature) => ValidateNotSelfIntersecting(feature);

function polygonStyles(color) {
  return {
    fillColor: color,
    fillOpacity: 0.25,
    outlineColor: color,
    outlineWidth: 3,
    closingPointColor: '#ffffff',
    closingPointOutlineColor: color,
    closingPointWidth: 7,
    closingPointOutlineWidth: 3,
    coordinatePointColor: '#ffffff',
    coordinatePointOutlineColor: color,
    coordinatePointWidth: 5,
    coordinatePointOutlineWidth: 2,
  };
}

function selectStyles(color) {
  return {
    selectedPolygonColor: color,
    selectedPolygonFillOpacity: 0.25,
    selectedPolygonOutlineColor: color,
    selectedPolygonOutlineWidth: 3,
    selectionPointColor: '#ffffff',
    selectionPointOutlineColor: color,
    selectionPointWidth: 7,
    selectionPointOutlineWidth: 3,
    midPointColor: color,
    midPointOutlineColor: '#ffffff',
    midPointWidth: 4,
    midPointOutlineWidth: 2,
  };
}

const HINTS = {
  empty: 'Tocá "Dibujar" para empezar el polígono.',
  drawing: 'Tocá el mapa para agregar vértices. Tocá el primero para cerrar la zona.',
  done: 'Arrastrá los vértices para ajustar. Tocá un punto intermedio para agregar uno.',
};

// Draws or edits a single polygon.
// initialRing: [[lon, lat], ...] or null. onChange(ring | null) when the polygon is closed or edited.
// contextZones: FeatureCollection of the other zones, shown muted.
export default function ZoneDrawMap({ initialRing, color, contextZones, onChange }) {
  const drawRef = useRef(null);
  const mapRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const [state, setState] = useState(initialRing ? 'done' : 'empty');
  const [canUndo, setCanUndo] = useState(false);
  const [mapConfig] = useState(getSavedMapConfig);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // The polygon in the store, if closed
  const readPolygon = useCallback(() => {
    const draw = drawRef.current;
    const feature = draw.getSnapshot()
      .find((f) => f.geometry.type === 'Polygon' && !f.properties.currentlyDrawing);

    return feature ?? null;
  }, []);

  const emitChange = useCallback(() => {
    const feature = readPolygon();
    onChangeRef.current?.(feature ? openRing(feature.geometry.coordinates) : null);
  }, [readPolygon]);

  const startDrawing = () => {
    const draw = drawRef.current;
    draw.clear();
    draw.setMode(POLYGON_MODE);
    setState('drawing');
    onChangeRef.current?.(null);
  };

  const undo = () => {
    const draw = drawRef.current;
    draw.undo();

    const feature = readPolygon();
    const drawing = draw.getSnapshot().some((f) => f.properties.currentlyDrawing);

    if (feature) {
      if (draw.getMode() !== SELECT_MODE) {
        draw.setMode(SELECT_MODE);
      }
      draw.selectFeature(feature.id);
      setState('done');
    } else {
      setState(drawing || draw.getMode() === POLYGON_MODE ? 'drawing' : 'empty');
    }

    setCanUndo(draw.canUndo());
    emitChange();
  };

  const handleLoad = (map) => {
    mapRef.current = map;

    // Other zones below the drawing layers
    addZoneLayers(map, { muted: true });
    if (contextZones) {
      setZoneData(map, contextZones);
    }

    const draw = new TerraDraw({
      adapter: new TerraDrawMapLibreGLAdapter({ map }),
      modes: [
        new TerraDrawPolygonMode({
          validation: notSelfIntersecting,
          styles: polygonStyles(color),
        }),
        new TerraDrawSelectMode({
          allowManualDeselection: false,
          flags: {
            polygon: {
              feature: {
                validation: notSelfIntersecting,
                coordinates: {
                  draggable: true,
                  midpoints: true,
                  deletable: true,
                },
              },
            },
          },
          styles: selectStyles(color),
        }),
      ],
      undoRedo: {
        modeLevel: new TerraDrawModeUndoRedo(),
        sessionLevel: new TerraDrawSessionUndoRedo(),
      },
    });

    draw.start();
    drawRef.current = draw;

    draw.on('finish', (id, context) => {
      if (context.action === 'draw') {
        draw.setMode(SELECT_MODE);
        draw.selectFeature(id);
        setState('done');
      }
      emitChange();
    });

    draw.on('change', (_ids, type) => {
      if (type === 'update' && draw.getMode() === SELECT_MODE) {
        emitChange();
      }
    });

    draw.on('history', () => setCanUndo(draw.canUndo()));

    if (initialRing) {
      const [result] = draw.addFeatures([{
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [closeRing(initialRing)] },
        properties: { mode: POLYGON_MODE },
      }]);

      draw.setMode(SELECT_MODE);
      draw.selectFeature(result.id);
      draw.clearUndoRedoHistory();
      setCanUndo(false);

      map.fitBounds(ringsBounds([initialRing]), { padding: 60, duration: 0 });
    } else {
      draw.setMode(POLYGON_MODE);
      setState('drawing');

      const bounds = ringsBounds(contextZones?.features.map((f) => openRing(f.geometry.coordinates)) ?? []);
      if (bounds) {
        map.fitBounds(bounds, { padding: 40, duration: 0, maxZoom: 16 });
      }
    }
  };

  // Zone type changed: recolor the drawing
  useEffect(() => {
    const draw = drawRef.current;
    if (!draw) {
      return;
    }

    draw.setModeStyles(POLYGON_MODE, polygonStyles(color));
    draw.setModeStyles(SELECT_MODE, selectStyles(color));
  }, [color]);

  useEffect(() => {
    if (mapRef.current && contextZones) {
      setZoneData(mapRef.current, contextZones);
    }
  }, [contextZones]);

  useEffect(() => () => {
    drawRef.current?.stop();
    drawRef.current = null;
  }, []);

  return (
    <div className={styles.container}>
      <BaseMap configs={mapConfig} onLoad={handleLoad} />

      <div className={styles.hint}>{HINTS[state]}</div>

      <div className={styles.toolbar}>
        <Button
          variant="secondary"
          size="sm"
          icon={Undo2}
          onClick={undo}
          disabled={!canUndo}
        >
          Deshacer
        </Button>

        {state === 'empty' && (
          <Button size="sm" icon={Pencil} onClick={startDrawing}>
            Dibujar
          </Button>
        )}

        {state !== 'empty' && (
          <Button variant="secondary" size="sm" icon={RotateCcw} onClick={startDrawing}>
            Redibujar
          </Button>
        )}
      </div>
    </div>
  );
}
