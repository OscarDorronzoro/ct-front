import { describe, it, expect } from 'vitest';
import { firmwareLabel, firmwareSizeLabel } from './firmware';

describe('firmware', () => {
  it('shows its version and its size', () => {
    expect(firmwareLabel({ version: '1.2.0' })).toBe('Firmware 1.2.0');
    expect(firmwareSizeLabel({ size: 1310720 })).toBe('1,25 MB');
  });
});
