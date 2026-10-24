import { useOutletContext } from 'react-router';
import { MapView, UpdatingBadge } from '@/widgets/map';
import { usePolling } from '@/shared/lib/polling';
import { getLatestPositions } from '@/entities/position';

const POLL_MS = 30000;
const NO_POINTS = [];

// Last known position of each collar, even if it stopped transmitting hours ago
export default function LivePage() {
  const { mapRef } = useOutletContext();
  const { data: points = NO_POINTS, stale, error } = usePolling(getLatestPositions, { intervalMs: POLL_MS });

  return (
    <>
      <MapView points={points} mode="live" ref={mapRef} />
      <UpdatingBadge stale={stale} error={error} />
    </>
  );
}
