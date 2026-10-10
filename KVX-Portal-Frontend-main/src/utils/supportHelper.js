/**
 * Support Center & Help Desk Helper
 * Implements article resolution, category browsing, ticket submission, and live chat activation
 * (Covers TS-220, TS-222, TS-223, TS-226, TS-227, TS-228, TS-229, TS-230, TS-234)
 */

export const HELP_CATEGORIES = [
  { id: 'getting-started', name: 'Getting Started', articleCount: 12, path: '/help/category/getting-started' },
  { id: 'account-security', name: 'Account & Security', articleCount: 8, path: '/help/category/account-security' },
  { id: 'billing-plans', name: 'Billing & Plans', articleCount: 6, path: '/help/category/billing-plans' },
  { id: 'api-integrations', name: 'API & Integrations', articleCount: 15, path: '/help/category/api-integrations' },
  { id: 'troubleshooting', name: 'Troubleshooting & FAQ', articleCount: 20, path: '/help/category/troubleshooting' }
];

export const POPULAR_ARTICLES = [
  { id: 'art-1', title: 'How to Reset Your Employee Portal Password', category: 'account-security', readTime: '3 min read', path: '/help/article/art-1' },
  { id: 'art-2', title: 'Setting Up Webhook Subscriptions', category: 'api-integrations', readTime: '5 min read', path: '/help/article/art-2' },
  { id: 'art-3', title: 'Understanding Payroll Cycles & Deductions', category: 'billing-plans', readTime: '4 min read', path: '/help/article/art-3' }
];

/**
 * TS-222: Resolves help category browsing path
 */
export const getHelpCategoryPath = (categoryId = 'getting-started') => {
  const cat = HELP_CATEGORIES.find(c => c.id === categoryId);
  return cat ? cat.path : '/help';
};

/**
 * TS-223: Resolves article path
 */
export const getArticlePath = (articleId = 'art-1') => {
  const art = POPULAR_ARTICLES.find(a => a.id === articleId);
  return art ? art.path : '/help';
};

/**
 * TS-227 & TS-229: Triggers live chat widget
 */
export const triggerLiveChat = () => {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('open-floating-chat', { detail: { open: true } }));
    return true;
  }
  return true;
};

/**
 * TS-228: Validates and processes Support Ticket creation
 */
export const submitSupportTicket = (ticketData) => {
  if (!ticketData || typeof ticketData !== 'object') {
    return { success: false, error: 'Ticket payload is required' };
  }

  const { subject, category, description } = ticketData;

  if (!subject || !subject.trim()) {
    return { success: false, error: 'Ticket subject is required' };
  }
  if (!description || !description.trim()) {
    return { success: false, error: 'Ticket description is required' };
  }

  const ticketId = `TICK-${Date.now().toString(36).toUpperCase()}`;
  return {
    success: true,
    ticketId,
    data: {
      id: ticketId,
      subject: subject.trim(),
      category: category || 'General Support',
      description: description.trim(),
      status: 'Open',
      createdAt: new Date().toISOString()
    }
  };
};
