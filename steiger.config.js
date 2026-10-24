import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

// Feature-Sliced Design rules (layers, slices, public APIs): `npm run lint:fsd`
export default defineConfig([
  ...fsd.configs.recommended,
  {
    // While the migration lasts: pages is still a flat folder (one slice for Steiger) and the
    // code in components/ and hooks/ isn't in a layer, so every entity looks used only once.
    // Enable again when the pages are sliced by route.
    rules: {
      'fsd/insignificant-slice': 'off',
    },
  },
]);
