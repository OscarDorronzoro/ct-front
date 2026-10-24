import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import {
  TerraDraw,
  TerraDrawPolygonMode,
  TerraDrawSelectMode,
  TerraDrawModeUndoRedo,
  TerraDrawSessionUndoRedo,
  ValidateNotSelfIntersecting,
} from 'terra-draw';
import { TerraDrawMapLibreGLAdapter } from 'terra-draw-maplibre-gl-adapter';
import {
  Pencil, Undo2, RotateCcw, Plus, Check,
} from 'lucide-react';
import { BaseMap, useBaseMap } from '@/shared/ui/map';
import { Button } from '@/shared/ui/button';
import { addZoneLayers, setZoneData, fitToZones } from '@/entities/zone';
import { closeRing, openRing, ringsBounds } from '@/shared/lib/geo';
import { addGuideLayers, setGuide, setGuideColor } from '../lib/drawGuide';
import styles from './ZoneDrawMap.module.css';

const SELECT_MODE = 'select';
const POLYGON_MODE = 'polygon';

const notSelfIntersecting = (feature) => ValidateNotSelfIntersecting(feature);

// Touch screens have no cursor, so terra-draw can't show the next side before the tap: there the
// vertices are placed with a crosshair at the center of the map (pan, then "Agregar punto")
const TOUCH = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

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
  drawing: TOUCH
    ? 'Mové el mapa hasta la mira y tocá "Agregar punto". Con 3 o más, "Cerrar".'
    : 'Hacé clic para agregar vértices. Hacé clic en el primero para cerrar la zona.',
  done: TOUCH
    ? 'Arrastrá los vértices para ajustar. Tocá un punto intermedio para agregar uno.'
    : 'Arrastrá los vértices para ajustar. Hacé clic en un punto intermedio para agregar uno.',
};

// terra-draw rejects coordinates with more decimals than its precision (9); 7 are ~1 cm
const toPrecision = ([lon, lat]) => [Number(lon.toFixed(7)), Number(lat.toFixed(7))];

const toPolygon = (ring) => ({
  type: 'Feature',
  geometry: { type: 'Polygon', coordinates: [closeRing(ring)] },
  properties: { mode: POLYGON_MODE },
});

// Draws or edits a single polygon.
// initialRing: [[lon, lat], ...] or null. onChange(ring | null) when the polygon is closed or edited.
// contextZones: FeatureCollection of the other zones, shown muted.
export default function ZoneDrawMap({
  initialRing, color, contextZones, onChange,
}) {
  const drawRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const [state, setState] = useState(initialRing ? 'done' : 'empty');
  const [canUndo, setCanUndo] = useState(false);
  // Touch: vertices placed with the crosshair, before the zone is closed
  const [points, setPoints] = useState([]);
  const pointsRef = useRef(points);
  const [notice, setNotice] = useState(null);

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

  // A closed polygon, selected to adjust its vertices. False if terra-draw rejects it.
  const selectPolygon = (ring) => {
    const draw = drawRef.current;
    const [result] = draw.addFeatures([toPolygon(ring)]);
    if (!result.valid) {
      return false;
    }

    draw.setMode(SELECT_MODE);
    draw.selectFeature(result.id);
    draw.clearUndoRedoHistory();
    setCanUndo(false);
    setState('done');
    return true;
  };

  const { mapRef, handleLoad } = useBaseMap((map) => {
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
          // A circle on each vertex while drawing (the corners of the zone)
          showCoordinatePoints: true,
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

    if (TOUCH) {
      addGuideLayers(map, color);
      map.on('move', () => {
        setGuide(map, pointsRef.current, map.getCenter().toArray());
      });
    }

    if (initialRing) {
      selectPolygon(initialRing);
      map.fitBounds(ringsBounds([initialRing]), { padding: 60, duration: 0 });
    } else {
      // Touch: select mode, so a tap doesn't add a vertex (the crosshair does)
      draw.setMode(TOUCH ? SELECT_MODE : POLYGON_MODE);
      setState('drawing');
      fitToZones(map, contextZones);
    }
  });

  // Touch: the guide follows the vertices placed (and the crosshair, on 'move')
  useEffect(() => {
    pointsRef.current = points;
    const map = mapRef.current;
    if (TOUCH && map) {
      setGuide(map, points, map.getCenter().toArray());
    }
  }, [points, mapRef]);

  const startDrawing = () => {
    const draw = drawRef.current;
    draw.clear();
    draw.setMode(TOUCH ? SELECT_MODE : POLYGON_MODE);
    setPoints([]);
    setNotice(null);
    setState('drawing');
    onChangeRef.current?.(null);
  };

  const addPoint = () => {
    setNotice(null);
    setPoints((current) => [...current, toPrecision(mapRef.current.getCenter().toArray())]);
  };

  const closeZone = () => {
    const { valid } = notSelfIntersecting(toPolygon(points));
    if (!valid || !selectPolygon(points)) {
      setNotice('Los lados no pueden cruzarse: deshacé el último punto o movelo.');
      return;
    }

    setNotice(null);
    setPoints([]);
    emitChange();
  };

  const undo = () => {
    // Touch, while drawing: the last vertex placed
    if (TOUCH && state === 'drawing') {
      setNotice(null);
      setPoints((current) => current.slice(0, -1));
      return;
    }

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

  // Zone type changed: recolor the drawing
  useEffect(() => {
    const draw = drawRef.current;
    if (!draw) {
      return;
    }

    draw.setModeStyles(POLYGON_MODE, polygonStyles(color));
    draw.setModeStyles(SELECT_MODE, selectStyles(color));
    if (TOUCH) {
      setGuideColor(mapRef.current, color);
    }
  }, [color, mapRef]);

  useEffect(() => {
    if (mapRef.current && contextZones) {
      setZoneData(mapRef.current, contextZones);
    }
  }, [contextZones, mapRef]);

  useEffect(() => () => {
    drawRef.current?.stop();
    drawRef.current = null;
  }, []);

  const crosshair = TOUCH && state === 'drawing';

  return (
    <div className={styles.container}>
      <BaseMap onLoad={handleLoad} />

      {crosshair && <div className={styles.crosshair} aria-hidden="true" />}

      <div className={`${styles.hint} ${notice ? styles.hintError : ''}`} role={notice ? 'alert' : undefined}>
        {notice ?? HINTS[state]}
      </div>

      <div className={styles.toolbar}>
        <Button
          variant="secondary"
          size="sm"
          icon={Undo2}
          onClick={undo}
          disabled={crosshair ? points.length === 0 : !canUndo}
        >
          Deshacer
        </Button>

        {crosshair && (
          <>
            <Button size="sm" icon={Plus} onClick={addPoint}>
              Agregar punto
            </Button>
            <Button variant="secondary" size="sm" icon={Check} onClick={closeZone} disabled={points.length < 3}>
              Cerrar
            </Button>
          </>
        )}

        {state === 'empty' && (
          <Button size="sm" icon={Pencil} onClick={startDrawing}>
            Dibujar
          </Button>
        )}

        {!crosshair && state !== 'empty' && (
          <Button variant="secondary" size="sm" icon={RotateCcw} onClick={startDrawing}>
            Redibujar
          </Button>
        )}
      </div>
    </div>
  );
}
