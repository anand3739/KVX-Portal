const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { query } = require('../config/database');
const { createNotification, createBulkNotifications } = require('../services/notificationService');
const {
  getArticles,
  getArticleById,
  toggleLikeArticle,
  getFaqs,
  getVideos,
  createSupportTicket,
  updateTicketStatus,
  addTicketComment,
  getSupportTickets,
  getTicketById
} = require('../services/helpCenterService');

const ALLOWED_TICKET_STATUSES = ['open', 'inprogress', 'resolved', 'closed'];

// GET /api/help/articles - fetch help articles
router.get('/articles', authenticate, async (req, res) => {
  try {
    const { category, search } = req.query;
    const articles = await getArticles({ category, search });
    res.json(articles);
  } catch (error) {
    console.error('Get help articles error:', error);
    res.status(500).json({ message: 'Server error fetching help articles' });
  }
});

// GET /api/help/articles/:id - fetch article details & increment view count
router.get('/articles/:id', authenticate, async (req, res) => {
  try {
    const article = await getArticleById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json(article);
  } catch (error) {
    console.error('Get help article error:', error);
    res.status(500).json({ message: 'Server error fetching article' });
  }
});

// POST /api/help/articles/:id/like - like an article
router.post('/articles/:id/like', authenticate, async (req, res) => {
  try {
    const updated = await toggleLikeArticle(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Like article error:', error);
    res.status(500).json({ message: 'Server error liking article' });
  }
});

// GET /api/help/faqs - fetch FAQs
router.get('/faqs', authenticate, async (req, res) => {
  try {
    const { category } = req.query;
    const faqs = await getFaqs(category);
    res.json(faqs);
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({ message: 'Server error fetching FAQs' });
  }
});

// GET /api/help/videos - fetch video tutorials
router.get('/videos', authenticate, async (req, res) => {
  try {
    const videos = await getVideos();
    res.json(videos);
  } catch (error) {
    console.error('Get help videos error:', error);
    res.status(500).json({ message: 'Server error fetching help videos' });
  }
});

// POST /api/help/tickets - create support ticket
router.post('/tickets', authenticate, async (req, res) => {
  try {
    const { subject, message, priority, type, category, assigned_to } = req.body;
    const ticket = await createSupportTicket({
      userId: req.user.id,
      userName: `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || req.user.email,
      userEmail: req.user.email,
      subject,
      message,
      priority,
      type,
      category,
      assignedTo: assigned_to
    });

    // Notify Admin users about new ticket (Fire & Forget safely)
    try {
      const adminUsersRes = await query(`SELECT id FROM employees WHERE role = 'admin' AND status IN ('active', 'probation')`);
      if (adminUsersRes.rows.length > 0) {
        const requesterName = `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || req.user.email;
        const adminNotifs = adminUsersRes.rows.map(a => ({
          user_id: a.id,
          type: 'info',
          title: 'New Ticket Raised',
          message: `${requesterName} raised a ${priority || 'normal'} ticket: "${subject}"`,
          link: '/admin/tickets'
        }));
        await createBulkNotifications(adminNotifs);
      }
    } catch (notifErr) {
      console.error('Failed to send new-ticket notification:', notifErr.message);
    }

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Create support ticket error:', error);
    res.status(500).json({ message: 'Server error creating support ticket' });
  }
});

// GET /api/help/tickets - get user's support tickets
router.get('/tickets', authenticate, async (req, res) => {
  try {
    const tickets = await getSupportTickets(req.user.role === 'admin' ? null : req.user.id);
    res.json(tickets);
  } catch (error) {
    console.error('Get support tickets error:', error);
    res.status(500).json({ message: 'Server error fetching support tickets' });
  }
});

// PUT /api/help/tickets/:id/status - update ticket status
router.put('/tickets/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || typeof status !== 'string') {
      return res.status(400).json({ message: 'Status is required' });
    }

    const normalizedStatus = status.toLowerCase().replace("-", "").replace(" ", "");

    if (!ALLOWED_TICKET_STATUSES.includes(normalizedStatus)) {
      return res.status(400).json({
        message: `Invalid status '${status}'. Allowed statuses: ${ALLOWED_TICKET_STATUSES.join(', ')}`
      });
    }

    const ticket = await getTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Ownership check: Admin can update any ticket; non-admin can update ONLY their own ticket
    if (req.user.role !== 'admin' && ticket.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only update your own tickets.' });
    }

    const updated = await updateTicketStatus(req.params.id, normalizedStatus);

    // Notify ticket owner about status update if non-self change
    try {
      if (ticket.user_id && ticket.user_id !== req.user.id) {
        const ownerRes = await query(`SELECT role FROM employees WHERE id = $1`, [ticket.user_id]);
        const ownerRole = ownerRes.rows[0]?.role;
        const targetLink = ownerRole === 'hr' ? '/hr/tickets' : '/employee/tickets';

        const statusLabels = {
          open: 'Open',
          inprogress: 'In Progress',
          resolved: 'Resolved',
          closed: 'Closed'
        };
        const statusText = statusLabels[normalizedStatus] || normalizedStatus;

        await createNotification({
          user_id: ticket.user_id,
          type: 'info',
          title: 'Ticket Status Updated',
          message: `Your ticket "${ticket.subject}" is now ${statusText}.`,
          link: targetLink
        });
      }
    } catch (notifErr) {
      console.error('Failed to send ticket status notification:', notifErr.message);
    }

    res.json(updated);
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({ message: 'Server error updating ticket status' });
  }
});

// POST /api/help/tickets/:id/comments - add comment/reply to ticket
router.post('/tickets/:id/comments', authenticate, async (req, res) => {
  try {
    const { text, time } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const ticket = await getTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Ownership check: Admin can comment on any ticket; non-admin can comment ONLY on their own ticket
    if (req.user.role !== 'admin' && ticket.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only comment on your own tickets.' });
    }

    // ELIMINATE SENDER SPOOFING: Derive sender identity strictly from authenticated req.user
    const senderDisplay = req.user.role === 'admin'
      ? 'ADMIN'
      : (`${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || req.user.role.toUpperCase());

    const commentObj = {
      from: senderDisplay,
      text: text.trim(),
      time: time || new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    };

    const updated = await addTicketComment(req.params.id, commentObj);

    // Notify ticket owner about reply if comment is from another user (e.g. Admin)
    try {
      if (ticket.user_id && ticket.user_id !== req.user.id) {
        const ownerRes = await query(`SELECT role FROM employees WHERE id = $1`, [ticket.user_id]);
        const ownerRole = ownerRes.rows[0]?.role;
        const targetLink = ownerRole === 'hr' ? '/hr/tickets' : '/employee/tickets';

        await createNotification({
          user_id: ticket.user_id,
          type: 'info',
          title: 'New Reply on Ticket',
          message: `Admin replied to your ticket: "${ticket.subject}"`,
          link: targetLink
        });
      }
    } catch (notifErr) {
      console.error('Failed to send ticket comment notification:', notifErr.message);
    }

    res.json(updated);
  } catch (error) {
    console.error('Add ticket comment error:', error);
    res.status(500).json({ message: 'Server error adding ticket comment' });
  }
});

module.exports = router;


