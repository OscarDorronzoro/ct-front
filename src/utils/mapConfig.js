const DEFAULT_MAP_CONFIG = {
  center: [-61.209824, -32.967354],
  zoom: 14,
};

// Last center/zoom followed by the live map
export function getSavedMapConfig() {
  try {
    const saved = localStorage.getItem('mapConfig');
    return saved ? JSON.parse(saved) : DEFAULT_MAP_CONFIG;
  } catch {
    return DEFAULT_MAP_CONFIG;
  }
}
