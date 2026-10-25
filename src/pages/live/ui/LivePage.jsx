import { useMemo } from 'react';
import { useOutletContext, useSearchParams } from 'react-router';
import { MapView, UpdatingBadge } from '@/widgets/map';
import { usePolling } from '@/shared/lib/polling';
import { getLatestPositions } from '@/entities/position';

const POLL_MS = 30000;
const NO_POINTS = [];

// Last known position of each collar, even if it stopped transmitting hours ago
export default function LivePage() {
  const { mapRef } = useOutletContext();
  const { data: points = NO_POINTS, stale, error } = usePolling(getLatestPositions, { intervalMs: POLL_MS });

  // ?cow=8: a notification of that cow opened the map
  const [params] = useSearchParams();
  const cowId = Number(params.get('cow')) || null;
  const focus = useMemo(() => (cowId ? { type: 'cow', id: cowId, label: 'La vaca' } : null), [cowId]);

  return (
    <>
      <MapView points={points} mode="live" focus={focus} ref={mapRef} />
      <UpdatingBadge stale={stale} error={error} />
    </>
  );
}
