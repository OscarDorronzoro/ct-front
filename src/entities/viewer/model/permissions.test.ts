import { describe, it, expect } from 'vitest';
import { can } from './permissions';

const viewer = { permissions: ['map:read', 'cows:read'] };
const admin = { permissions: ['map:read', 'cows:read', 'cows:write', 'users:manage'] };

describe('can', () => {
  it('checks the permissions of the user', () => {
    expect(can(admin, 'cows:write')).toBe(true);
    expect(can(viewer, 'cows:write')).toBe(false);
  });

  it('accepts any of several permissions', () => {
    expect(can(viewer, 'cows:write', 'cows:read')).toBe(true);
  });

  it('allows nothing without a user', () => {
    expect(can(null, 'map:read')).toBe(false);
  });
});
