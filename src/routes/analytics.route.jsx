import AnalyticsLayout from '@/layouts/AnalyticsLayout';

// Lazy: the explorer and its charts are only needed here
const loadExplorerPage = async () => ({
  Component: (await import('@/pages/ExplorerPage')).default,
});

export const analyticsRoute = {
  path: 'analytics',
  element: <AnalyticsLayout />,
  children: [
    { index: true, lazy: loadExplorerPage },
  ],
};
