import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Unmount what each test rendered (Testing Library only does it by itself with global test APIs)
afterEach(() => {
  cleanup();
});
