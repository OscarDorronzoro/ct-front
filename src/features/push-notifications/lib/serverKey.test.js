import { describe, it, expect } from 'vitest';
import { serverKeyBytes, madeWithKey } from './serverKey';

describe('serverKeyBytes', () => {
  it('decodes base64url without padding', () => {
    // 0xfb 0xff 0xbf: '+/+/' in base64, '-_-_' in base64url
    expect([...serverKeyBytes('-_-_')]).toEqual([0xfb, 0xff, 0xbf]);
    expect([...serverKeyBytes('AQI')]).toEqual([1, 2]);
  });
});

describe('madeWithKey', () => {
  const key = Uint8Array.from([1, 2, 3]);
  const subscription = (bytes) => ({ options: { applicationServerKey: bytes && Uint8Array.from(bytes).buffer } });

  it('tells whether the subscription was made with this key', () => {
    expect(madeWithKey(subscription([1, 2, 3]), key)).toBe(true);
    expect(madeWithKey(subscription([1, 2, 4]), key)).toBe(false);
    expect(madeWithKey(subscription([1, 2]), key)).toBe(false);
  });

  it('is false when the browser does not tell the key', () => {
    expect(madeWithKey(subscription(null), key)).toBe(false);
    expect(madeWithKey({}, key)).toBe(false);
  });
});
