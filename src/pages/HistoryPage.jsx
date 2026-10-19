import { useCallback, useState } from 'react';
import { useOutletContext } from 'react-router';

import MapView from '../components/MapView';
import RangePicker from '../components/history/RangePicker';
import UpdatingBadge from '../components/map/UpdatingBadge';
import usePolling from '../hooks/usePolling';
import { getPosition, getDistances } from '../services/position';
import { defaultRange, resolveRange } from '../utils/dateRange';

const POLL_MS = 30000;
const EMPTY = { points: [], distances: [], referenceTime: null };

export default function HistoryPage() {
  const [range, setRange] = useState(defaultRange);
  const { mapRef } = useOutletContext();

  // Points, distance per collar and the time their colors are computed against (end of the
  // range). Loaded together: changing the range doesn't recolor the old points meanwhile.
  // Fixed range: one load. Live range: polling, moving the end (and the start if rolling).
  const load = useCallback(() => {
    const { from, to } = resolveRange(range);
    const params = { dateFrom: from.toISOString(), dateTo: to.toISOString() };

    return Promise.all([
      getPosition(params),
      // Secondary: the map still works without it
      getDistances(params).catch(() => []),
    ]).then(([points, distances]) => ({
      points,
      distances,
      referenceTime: range.live ? null : to,
    }));
  }, [range]);

  const { data = EMPTY, stale, error } = usePolling(load, { intervalMs: range.live ? POLL_MS : null });

  return (
    <div style={{
      backgroundColor: '#b07d62',
      height: '100%',
      width: '100%',
      position: 'relative',
    }}>
      <RangePicker range={range} onChange={setRange} />

      {/* Point colors by age relative to the end of the range (now when live) */}
      <MapView
        points={data.points}
        mode='history'
        referenceTime={data.referenceTime}
        distances={data.distances}
        ref={mapRef}
      />
      <UpdatingBadge stale={stale} error={error} />
    </div>
  );
}
