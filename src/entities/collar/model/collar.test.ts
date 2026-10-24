import { describe, it, expect } from 'vitest';
import { collarLabel } from './collar';

describe('collarLabel', () => {
  it('names a collar by its LoRa code, or its id before it has one', () => {
    expect(collarLabel({ id: 130, code: 12 })).toBe('Collar 12');
    expect(collarLabel({ id: 130, code: null })).toBe('Collar 130');
  });
});
