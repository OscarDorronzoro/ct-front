import { describe, it, expect } from 'vitest';
import { SETTINGS_ITEMS, visibleItems } from './navItems';

const viewer = { permissions: ['map:read', 'cows:read'] };
const admin = { permissions: ['map:read', 'cows:read', 'cows:write', 'users:manage'] };

describe('visibleItems', () => {
  const labels = (user) => visibleItems(SETTINGS_ITEMS, user).map((item) => item.label);

  it('shows Usuarios only with users:manage', () => {
    expect(labels(admin)).toContain('Usuarios');
    expect(labels(viewer)).not.toContain('Usuarios');
    expect(labels(viewer)).toContain('Vacas');
  });
});
