import { describe, it, expect } from 'vitest';
import { describeUserAgent } from './userAgent';

describe('describeUserAgent', () => {
  it.each([
    ['Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36',
      'Chrome · Android', true],
    ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 Edg/130.0',
      'Edge · Windows', false],
    ['Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/26.0 Chrome/122.0 Mobile Safari/537.36',
      'Samsung Internet · Android', true],
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      'Safari · iOS', true],
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7; rv:131.0) Gecko/20100101 Firefox/131.0',
      'Firefox · macOS', false],
  ])('%s', (ua, label, mobile) => {
    expect(describeUserAgent(ua)).toEqual({ label, mobile });
  });

  it('describes unknown or missing user agents', () => {
    expect(describeUserAgent('curl/8.5.0').label).toBe('Dispositivo desconocido');
    expect(describeUserAgent(null)).toEqual({ label: 'Dispositivo desconocido', mobile: false });
  });
});
