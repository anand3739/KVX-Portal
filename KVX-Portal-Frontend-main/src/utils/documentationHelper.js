/**
 * Documentation & Developer Portal Helper
 * Implements search indexing, guide routing, and tutorial links
 * (Covers TS-205, TS-206, TS-207, TS-208, TS-209, TS-210, TS-211, TS-212)
 */

export const DOCS_CATALOG = [
  {
    id: 'quick-start',
    title: 'Quick Start Guide',
    category: 'Getting Started',
    path: '/docs/quick-start',
    description: 'Learn how to integrate and set up KRAVIX Portal in under 5 minutes.',
    tutorialUrl: 'https://www.youtube.com/watch?v=sample-quickstart'
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    category: 'API & SDKs',
    path: '/docs/api-reference',
    description: 'Explore full REST API endpoints, JWT auth specs, and SDK downloads.',
    tutorialUrl: 'https://www.youtube.com/watch?v=sample-api'
  },
  {
    id: 'explore-overview',
    title: 'Explore Portal Architecture',
    category: 'Overview',
    path: '/docs/overview',
    description: 'Overview of enterprise architecture, microservices, and database models.',
    tutorialUrl: 'https://www.youtube.com/watch?v=sample-overview'
  },
  {
    id: 'authentication',
    title: 'Authentication & Security',
    category: 'Security',
    path: '/docs/auth',
    description: 'Configure JWT tokens, rate limiting, and RBAC permissions.',
    tutorialUrl: 'https://www.youtube.com/watch?v=sample-auth'
  }
];

/**
 * Searches documentation articles by title, description, or category (TS-205, TS-206)
 */
export const searchDocs = (query, catalog = DOCS_CATALOG) => {
  if (!query || typeof query !== 'string') return catalog;
  const q = query.toLowerCase().trim();
  if (!q) return catalog;

  return catalog.filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.description.toLowerCase().includes(q) ||
    item.category.toLowerCase().includes(q)
  );
};

/**
 * Resolves documentation route paths (TS-207, TS-208, TS-209, TS-210, TS-211)
 */
export const getDocRoutePath = (docId) => {
  const doc = DOCS_CATALOG.find(d => d.id === docId);
  return doc ? doc.path : '/docs/overview';
};

/**
 * Resolves video tutorial URLs (TS-212)
 */
export const getTutorialUrl = (docId = 'quick-start') => {
  const doc = DOCS_CATALOG.find(d => d.id === docId);
  return doc?.tutorialUrl || 'https://www.youtube.com/channel/UClzXUUN7k22pFkuwSSlpyiw';
};
