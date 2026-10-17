import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router';

import MapView from '../components/MapView';
import RangePicker from '../components/history/RangePicker';
import { getPosition } from '../services/position';
import { defaultRange, resolveRange } from '../utils/dateRange';
import logger from '../utils/logger';

const POLL_MS = 30000;

export default function HistoryPage() {
  // Points with the time their colors are computed against (end of the range they belong to).
  // Kept together: changing the range doesn't recolor the old points until the new ones load.
  const [data, setData] = useState({ points: [], referenceTime: null });
  const [range, setRange] = useState(defaultRange);
  const { mapRef } = useOutletContext();

  // Fixed range: one fetch. Live range: poll, moving the end (and the start if rolling).
  useEffect(() => {
    let cancelled = false;

    const fetchData = () => {
      const { from, to } = resolveRange(range);

      getPosition({
        dateFrom: from.toISOString(),
        dateTo: to.toISOString(),
      })
        .then((points) => {
          if (!cancelled) {
            setData({ points, referenceTime: range.live ? null : to });
          }
        })
        .catch((err) => logger.error('Error loading positions', err));
    };

    fetchData();

    if (!range.live) {
      return () => { cancelled = true; };
    }

    const id = setInterval(fetchData, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [range]);

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
        ref={mapRef}
      />
    </div>
  );
}
