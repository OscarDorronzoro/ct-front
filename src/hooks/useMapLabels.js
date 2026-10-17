import { useCallback, useEffect, useState } from 'react';

import { getAllCows } from '../services/cow';
import { getAllCollars } from '../services/collar';
import { cowLabel, collarLabel } from '../utils/labels';
import logger from '../utils/logger';

// Names for map positions: the cow, or the collar when it has no cow
export default function useMapLabels() {
  const [cows, setCows] = useState(new Map());
  const [collars, setCollars] = useState(new Map());

  useEffect(() => {
    Promise.all([getAllCows(), getAllCollars()])
      .then(([cowList, collarList]) => {
        setCows(new Map(cowList.map((c) => [c.id, c])));
        setCollars(new Map(collarList.map((c) => [c.id, c])));
      })
      .catch((err) => logger.error('Error loading map labels', err));
  }, []);

  return useCallback(({ cowId, collarId }) => {
    const cow = cowId !== null && cowId !== undefined ? cows.get(cowId) : null;
    if (cow) {
      return cowLabel(cow);
    }

    const collar = collars.get(collarId);
    return collar ? collarLabel(collar) : `Collar ${collarId}`;
  }, [cows, collars]);
}
