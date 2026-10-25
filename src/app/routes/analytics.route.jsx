import ContentLayout from '../layouts/ContentLayout';

// Lazy: the explorer and its charts are only needed here
const loadExplorerPage = async () => ({
  Component: (await import('@/pages/analytics')).ExplorerPage,
});

export const analyticsRoute = {
  path: 'analytics',
  element: <ContentLayout />,
  children: [
    { index: true, lazy: loadExplorerPage },
  ],
};
