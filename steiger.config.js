import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

// Feature-Sliced Design rules (layers, slices, public APIs): `npm run lint:fsd`
export default defineConfig([
  ...fsd.configs.recommended,
  {
    // Slices used from a single place are kept on purpose: each one is a unit of the domain
    // (breed, category) or a user action / page section (login, zone drawing, explorer...),
    // and they keep the pages small.
    rules: {
      'fsd/insignificant-slice': 'off',
    },
  },
]);
