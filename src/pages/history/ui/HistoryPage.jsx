import { useCallback, useState } from 'react';
import { useOutletContext } from 'react-router';
import { MapView, UpdatingBadge } from '@/widgets/map';
import { RangePicker } from '@/features/select-history-range';
import { usePolling } from '@/shared/lib/polling';
import { getPositions, getDistances } from '@/entities/position';
import { defaultRange, resolveRange } from '@/shared/lib/date';

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
      getPositions(params),
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
    <>
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
    </>
  );
}
