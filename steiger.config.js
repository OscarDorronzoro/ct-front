import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

// Feature-Sliced Design rules (layers, slices, public APIs): `npm run lint:fsd`
export default defineConfig([...fsd.configs.recommended]);
