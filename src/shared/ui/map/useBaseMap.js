import { useRef, useState } from 'react';

// The map of a BaseMap once it's loaded: <BaseMap onLoad={handleLoad} />.
// setup(map) adds the layers and handlers; `ready` turns true after it (effects that use the map
// wait for it).
export default function useBaseMap(setup) {
  const mapRef = useRef(null);
  const [ready, setReady] = useState(false);

  const handleLoad = (map) => {
    mapRef.current = map;
    setup?.(map);
    setReady(true);
  };

  return { mapRef, ready, handleLoad };
}
