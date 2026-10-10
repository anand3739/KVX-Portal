/**
 * Universal CTA Navigation and Action Helper
 * Resolves non-clickable CTAs and connects them to valid routes / mailto / external links
 * (Covers TS-127, TS-141, TS-145, TS-147, TS-185, TS-186, TS-190, TS-191, TS-197, TS-201, TS-233, TS-237, TS-241, TS-242, TS-243, TS-245, TS-251)
 */

export const CTA_ROUTES = {
  // Technologies & Solutions
  'view-all-studies': { type: 'route', target: '/case-studies' },
  'mobile-learn-more': { type: 'route', target: '/solutions/mobile-apps' },
  'start-migration': { type: 'route', target: '/contact?type=cloud-migration' },
  'start-migration-journey': { type: 'route', target: '/contact?type=cloud-migration' },

  // Contact & Sales
  'view-pricing-plan': { type: 'route', target: '/pricing' },
  'contact-sales': { type: 'route', target: '/contact?type=sales' },
  'view-knowledge-base': { type: 'route', target: '/help' },
  'partner-learn-more': { type: 'route', target: '/partnerships' },

  // Legal & Compliance
  'dpa': { type: 'route', target: '/legal/dpa' },
  'compliance-report': { type: 'route', target: '/legal/compliance-report' },
  'terms-important-notice': { type: 'route', target: '/legal/terms#notices' },
  'terms-updates': { type: 'route', target: '/legal/terms#updates' },
  'view-on-map': { type: 'external', target: 'https://maps.google.com/?q=Kravix+Tech+Headquarters' },

  // Direct Mail Actions
  'email-support': { type: 'mailto', target: 'mailto:support@kravixtech.com' },
  'email-sales': { type: 'mailto', target: 'mailto:sales@kravixtech.com' },
  'email-press': { type: 'mailto', target: 'mailto:press@kravixtech.com' },
  'email-legal': { type: 'mailto', target: 'mailto:legal@kravixtech.com' },
  'email-privacy': { type: 'mailto', target: 'mailto:privacy@kravixtech.com' }
};

export const getCtaTarget = (actionKey) => {
  return CTA_ROUTES[actionKey] || null;
};

export const handleCtaNavigation = (actionKey, navigate = null) => {
  const cta = CTA_ROUTES[actionKey];
  if (!cta) {
    console.warn(`[CTA Helper] Unknown action key: ${actionKey}`);
    return false;
  }

  if (typeof window === 'undefined') {
    return true;
  }

  switch (cta.type) {
    case 'mailto':
      window.location.href = cta.target;
      return true;
    case 'external':
      window.open(cta.target, '_blank', 'noopener,noreferrer');
      return true;
    case 'route':
      if (typeof navigate === 'function') {
        navigate(cta.target);
      } else {
        window.location.hash = cta.target;
      }
      return true;
    default:
      return false;
  }
};
