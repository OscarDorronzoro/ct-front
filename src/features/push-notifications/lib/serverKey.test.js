import { describe, it, expect } from 'vitest';
import { serverKeyBytes } from './serverKey';

describe('serverKeyBytes', () => {
  it('decodes base64url without padding', () => {
    // 0xfb 0xff 0xbf: '+/+/' in base64, '-_-_' in base64url
    expect([...serverKeyBytes('-_-_')]).toEqual([0xfb, 0xff, 0xbf]);
    expect([...serverKeyBytes('AQI')]).toEqual([1, 2]);
  });
});
