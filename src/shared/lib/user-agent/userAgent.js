// Readable device from a user agent: { label: 'Chrome · Android', mobile: true }.
// Only for display; order matters (Edge and Samsung also say Chrome, Chrome also says Safari).
const BROWSERS = [
  [/EdgA?\//, 'Edge'],
  [/SamsungBrowser\//, 'Samsung Internet'],
  [/OPR\//, 'Opera'],
  [/Firefox\/|FxiOS\//, 'Firefox'],
  [/Chrome\/|CriOS\//, 'Chrome'],
  [/Safari\//, 'Safari'],
];

const SYSTEMS = [
  [/Android/, 'Android'],
  [/iPhone|iPad|iPod/, 'iOS'],
  [/Windows/, 'Windows'],
  [/Mac OS X|Macintosh/, 'macOS'],
  [/CrOS/, 'ChromeOS'],
  [/Linux/, 'Linux'],
];

function match(list, ua) {
  return list.find(([regex]) => regex.test(ua))?.[1] ?? null;
}

export function describeUserAgent(ua) {
  if (!ua) {
    return { label: 'Dispositivo desconocido', mobile: false };
  }

  const browser = match(BROWSERS, ua);
  const system = match(SYSTEMS, ua);
  const label = [browser, system].filter(Boolean).join(' · ') || 'Dispositivo desconocido';

  return { label, mobile: /Mobi|Android|iPhone|iPad/.test(ua) };
}
