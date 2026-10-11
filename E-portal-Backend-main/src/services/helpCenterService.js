const { query } = require('../config/database');

const SEED_ARTICLES = [
  {
    title: "Getting Started with KRAVIX Portal",
    description: "Learn the basics of navigating and using the employee portal",
    category: "getting-started",
    views: 2345,
    likes: 156,
    author: "Admin Team",
    date: "2024-01-10",
    content: "Welcome to KRAVIX Portal! This guide will walk you through the key features:\n\n1. **Dashboard Overview** – Your homepage shows your upcoming tasks, attendance summary, and recent announcements.\n\n2. **Navigation** – Use the left sidebar to access HR features, payroll, leave management, and more.\n\n3. **Profile Settings** – Click your avatar (top right) to update your profile, change password, or sign out.\n\n4. **Notifications** – The bell icon shows real-time alerts for leave approvals, payroll updates, and announcements.\n\nContact IT support at it@kravix.com if you need further assistance."
  },
  {
    title: "How to Request Time Off",
    description: "Step-by-step guide for submitting and managing leave requests",
    category: "guides",
    views: 1892,
    likes: 98,
    author: "HR Department",
    date: "2024-01-12",
    content: "To request time off:\n\n1. Navigate to **Leave Management** in the sidebar.\n2. Click **Apply for Leave**.\n3. Select the leave type (Annual, Sick, Personal).\n4. Choose your start and end dates.\n5. Add a reason and any supporting documents.\n6. Click **Submit** – your manager will be notified automatically.\n\nLeave balances are shown on your dashboard. Approved leaves appear in your calendar."
  },
  {
    title: "Understanding Your Payroll",
    description: "Complete guide to viewing and understanding your payslips",
    category: "guides",
    views: 1567,
    likes: 87,
    author: "Finance Team",
    date: "2024-01-08",
    content: "Your payslip breakdown:\n\n- **Basic Salary** – Your agreed fixed monthly pay\n- **HRA** – House Rent Allowance (if applicable)\n- **Deductions** – PF, professional tax, and TDS\n- **Net Pay** – What is credited to your account\n\nPayslips are generated on the 28th of each month and available under **Documents → Payslips**. Download as PDF or view online."
  },
  {
    title: "Setting Up Two-Factor Authentication",
    description: "Secure your account with 2FA - step by step instructions",
    category: "guides",
    views: 3456,
    likes: 234,
    author: "IT Security",
    date: "2024-01-05",
    content: "Enable 2FA in 3 steps:\n\n1. Go to **Settings → Security**.\n2. Toggle **Two-Factor Authentication** on.\n3. Scan the QR code with Google Authenticator or Authy.\n\nEach login will now require your 6-digit OTP in addition to your password. Keep your backup codes in a safe place!"
  },
  {
    title: "Navigating the Dashboard",
    description: "Video tutorial on using the main dashboard features",
    category: "tutorials",
    views: 4231,
    likes: 312,
    author: "Training Team",
    date: "2024-01-03",
    content: "This video tutorial covers:\n\n- Widgets overview and customization\n- Quick action shortcuts\n- Filtering and date range selection\n- Exporting dashboard data\n\nPause the video at any section and follow along in the portal."
  },
  {
    title: "Common Login Issues",
    description: "Solutions for frequently encountered login problems",
    category: "faq",
    views: 5678,
    likes: 445,
    author: "Support Team",
    date: "2024-01-01",
    content: "**Cannot log in?**\n\n✔ Ensure CAPS LOCK is off\n✔ Use your company email (e.g., name@kravix.com)\n✔ Try 'Forgot Password' to reset your credentials\n\n**Locked out?**\nAfter 5 failed attempts, your account locks for 15 minutes. Contact HR or IT to manually unlock.\n\n**Browser issues?**\nClear your cache or try an incognito window. Supported: Chrome, Firefox, Edge (latest versions)."
  }
];

const SEED_FAQS = [
  { question: "How do I reset my password?", answer: "Click on 'Forgot Password' on the login page and follow the instructions sent to your email.", category: "account" },
  { question: "What should I do if I'm locked out of my account?", answer: "Contact your HR administrator or IT support for assistance with account recovery.", category: "account" },
  { question: "How do I view my payslips?", answer: "Navigate to Employee Dashboard → Documents → Payslips section.", category: "payroll" },
  { question: "Can I access the portal on my phone?", answer: "Yes, the portal is fully responsive and works on all mobile devices.", category: "technical" },
  { question: "How do I update my emergency contact?", answer: "Go to My Profile → Personal Info → Emergency Contact and click Edit.", category: "account" },
  { question: "What are the supported browsers?", answer: "We support the latest versions of Chrome, Firefox, Microsoft Edge, and Safari.", category: "technical" }
];

const SEED_VIDEOS = [
  { title: "Getting Started Guide", duration: "5:30 min", thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=60" },
  { title: "Leave Management", duration: "4:15 min", thumbnail: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&auto=format&fit=crop&q=60" },
  { title: "Payroll Overview", duration: "6:45 min", thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=60" }
];

const initHelpCenterTables = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS help_articles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL DEFAULT 'getting-started',
        views INT DEFAULT 0,
        likes INT DEFAULT 0,
        author VARCHAR(255) DEFAULT 'KRAVIX Support',
        date VARCHAR(50),
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS help_faqs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'account',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS help_videos (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        duration VARCHAR(50) DEFAULT '5:00 min',
        thumbnail TEXT,
        url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES employees(id) ON DELETE SET NULL,
        user_name VARCHAR(255),
        user_email VARCHAR(255),
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        priority VARCHAR(50) DEFAULT 'normal',
        status VARCHAR(50) DEFAULT 'open',
        type VARCHAR(50) DEFAULT 'email',
        category VARCHAR(100) DEFAULT 'General',
        assigned_to VARCHAR(255) DEFAULT 'Support Team',
        comments JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await query(`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'General'`);
    await query(`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(255) DEFAULT 'Support Team'`);
    await query(`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]'::jsonb`);

    // Seed articles if empty
    const artCountRes = await query(`SELECT COUNT(*) FROM help_articles`);
    if (parseInt(artCountRes.rows[0].count, 10) === 0) {
      for (const art of SEED_ARTICLES) {
        await query(
          `INSERT INTO help_articles (title, description, category, views, likes, author, date, content)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [art.title, art.description, art.category, art.views, art.likes, art.author, art.date, art.content]
        );
      }
    }

    // Seed FAQs if empty
    const faqCountRes = await query(`SELECT COUNT(*) FROM help_faqs`);
    if (parseInt(faqCountRes.rows[0].count, 10) === 0) {
      for (const faq of SEED_FAQS) {
        await query(
          `INSERT INTO help_faqs (question, answer, category)
           VALUES ($1, $2, $3)`,
          [faq.question, faq.answer, faq.category]
        );
      }
    }

    // Seed Videos if empty
    const vidCountRes = await query(`SELECT COUNT(*) FROM help_videos`);
    if (parseInt(vidCountRes.rows[0].count, 10) === 0) {
      for (const vid of SEED_VIDEOS) {
        await query(
          `INSERT INTO help_videos (title, duration, thumbnail)
           VALUES ($1, $2, $3)`,
          [vid.title, vid.duration, vid.thumbnail]
        );
      }
    }
  } catch (err) {
    if (process.env.ALLOW_START_WITHOUT_DB !== 'true') {
      console.error("Help Center Table Init Error:", err.message);
    }
  }
};

// Run table initialization on startup if database is available
if (process.env.NODE_ENV !== 'test') {
  initHelpCenterTables().catch(() => {});
}

const getArticles = async ({ category, search } = {}) => {
  let sql = `SELECT * FROM help_articles WHERE 1=1`;
  const params = [];

  if (category && category !== "all") {
    params.push(category);
    sql += ` AND category = $${params.length}`;
  }

  if (search && search.trim() !== "") {
    params.push(`%${search.trim().toLowerCase()}%`);
    sql += ` AND (LOWER(title) LIKE $${params.length} OR LOWER(description) LIKE $${params.length} OR LOWER(content) LIKE $${params.length})`;
  }

  sql += ` ORDER BY created_at ASC`;
  const result = await query(sql, params);
  return result.rows;
};

const getArticleById = async (id) => {
  // Increment view count
  await query(`UPDATE help_articles SET views = views + 1 WHERE id = $1`, [id]);
  const result = await query(`SELECT * FROM help_articles WHERE id = $1`, [id]);
  return result.rows[0];
};

const toggleLikeArticle = async (id) => {
  const result = await query(
    `UPDATE help_articles SET likes = likes + 1 WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

const getFaqs = async (category) => {
  let sql = `SELECT * FROM help_faqs WHERE 1=1`;
  const params = [];
  if (category && category !== "all") {
    params.push(category);
    sql += ` AND category = $${params.length}`;
  }
  sql += ` ORDER BY created_at ASC`;
  const result = await query(sql, params);
  return result.rows;
};

const getVideos = async () => {
  const result = await query(`SELECT * FROM help_videos ORDER BY created_at ASC`);
  return result.rows;
};

const createSupportTicket = async ({ userId, userName, userEmail, subject, message, priority = "normal", type = "email", category = "General", assignedTo = "Support Team" }) => {
  const result = await query(
    `INSERT INTO support_tickets (user_id, user_name, user_email, subject, message, priority, type, category, assigned_to, comments)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [userId || null, userName || null, userEmail || null, subject, message, priority, type, category, assignedTo, JSON.stringify([])]
  );
  return result.rows[0];
};

const updateTicketStatus = async (id, status) => {
  const result = await query(
    `UPDATE support_tickets SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0];
};

const addTicketComment = async (id, commentObj) => {
  const ticketRes = await query(`SELECT comments FROM support_tickets WHERE id = $1`, [id]);
  if (!ticketRes.rows[0]) return null;
  let existing = [];
  try {
    existing = Array.isArray(ticketRes.rows[0].comments)
      ? ticketRes.rows[0].comments
      : (typeof ticketRes.rows[0].comments === 'string' ? JSON.parse(ticketRes.rows[0].comments) : []);
  } catch (e) {
    existing = [];
  }
  const updated = [...existing, commentObj];
  const result = await query(
    `UPDATE support_tickets SET comments = $1 WHERE id = $2 RETURNING *`,
    [JSON.stringify(updated), id]
  );
  return result.rows[0];
};

const getSupportTickets = async (userId) => {
  let sql = `
    SELECT 
      st.*,
      COALESCE(e.role, 'employee') AS requester_role,
      COALESCE(d.name, 'General') AS requester_department
    FROM support_tickets st
    LEFT JOIN employees e ON st.user_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
  `;
  const params = [];
  if (userId) {
    sql += ` WHERE st.user_id = $1`;
    params.push(userId);
  }
  sql += ` ORDER BY st.created_at DESC`;
  const result = await query(sql, params);
  return result.rows;
};

const getTicketById = async (id) => {
  const result = await query(`
    SELECT 
      st.*,
      COALESCE(e.role, 'employee') AS requester_role,
      COALESCE(d.name, 'General') AS requester_department
    FROM support_tickets st
    LEFT JOIN employees e ON st.user_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE st.id = $1
  `, [id]);
  return result.rows[0] || null;
};



module.exports = {
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
};

