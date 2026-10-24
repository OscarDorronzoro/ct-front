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

// Saved by the live map as it follows the cows: the other maps start there
export function saveMapConfig({ center, zoom }) {
  try {
    localStorage.setItem('mapConfig', JSON.stringify({ center, zoom }));
  } catch {
    // Storage unavailable (private mode): the maps start at the default place
  }
}
