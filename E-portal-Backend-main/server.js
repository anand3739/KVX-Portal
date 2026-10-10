const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Load environment variables
dotenv.config();

// Import database connection
const { testConnection } = require('./src/config/database');

// Import routes with error handling wrapper
const safeRequire = (modulePath) => {
  try {
    const module = require(modulePath);
    console.log(`✅ Loaded: ${modulePath}`);
    return module;
  } catch (error) {
    console.error(`❌ Failed to load ${modulePath}:`, error.message);
    const dummyRouter = express.Router();
    dummyRouter.all('*', (req, res) => {
      res.status(501).json({
        message: `Route module ${modulePath} not properly implemented`,
        error: error.message,
      });
    });
    return dummyRouter;
  }
};

// Import routes with safe wrapper
const authRoutes = safeRequire('./src/routes/authRoutes');
const employeeRoutes = safeRequire('./src/routes/employeeRoutes');
const attendanceRoutes = safeRequire('./src/routes/attendanceRoutes');
const leaveRoutes = safeRequire('./src/routes/leaveRoutes');
const documentRoutes = safeRequire('./src/routes/documentRoutes');
const payrollRoutes = safeRequire('./src/routes/payrollRoutes');
const recruitmentRoutes = safeRequire('./src/routes/recruitmentRoutes');
const departmentRoutes = safeRequire('./src/routes/departmentRoutes');
const taskRoutes = safeRequire('./src/routes/taskRoutes');
const messageRoutes = safeRequire('./src/routes/messageRoutes');
const mailboxRoutes = safeRequire('./src/routes/mailboxRoutes');
const notificationRoutes = safeRequire('./src/routes/notificationRoutes');
const reportRoutes = safeRequire('./src/routes/reportRoutes');
const performanceReviewRoutes = safeRequire('./src/routes/performanceReviewRoutes');
const performanceRoutes = safeRequire('./src/routes/performanceRoutes');
const trainingRoutes = safeRequire('./src/routes/trainingRoutes');
const remindersRoutes = safeRequire('./src/routes/remindersRoutes');
const settingsRoutes = safeRequire('./src/routes/settingsRoutes');
const announcementsRoutes = safeRequire('./src/routes/announcementsRoutes');
const auditLogRoutes = safeRequire('./src/routes/auditLogRoutes');
const helpCenterRoutes = safeRequire('./src/routes/helpCenterRoutes');
const apiKeyRoutes = safeRequire('./src/routes/apiKeyRoutes');
const designationRoutes = safeRequire('./src/routes/designationRoutes');
const roleRoutes = safeRequire('./src/routes/roleRoutes');
const permissionRoutes = safeRequire('./src/routes/permissionRoutes');
const backupRoutes = safeRequire('./src/routes/backupRoutes');
const ceoRoutes = safeRequire('./src/routes/ceoRoutes');
const eventsRoutes = safeRequire('./src/routes/eventsRoutes');
const bankDetailsRoutes = safeRequire('./src/routes/bankDetailsRoutes');

// Enterprise Portal Routes
const securityRoutes = safeRequire('./src/routes/securityRoutes');
const employeeServicesRoutes = safeRequire('./src/routes/employeeServicesRoutes');
const careerRoutes = safeRequire('./src/routes/careerRoutes');
const rewardsRoutes = safeRequire('./src/routes/rewardsRoutes');
const workManagementRoutes = safeRequire('./src/routes/workManagementRoutes');
const knowledgeRoutes = safeRequire('./src/routes/knowledgeRoutes');
const hrWorkforceRoutes = safeRequire('./src/routes/hrWorkforceRoutes');
const assetsFacilitiesRoutes = safeRequire('./src/routes/assetsFacilitiesRoutes');
const employeeJourneyRoutes = safeRequire('./src/routes/employeeJourneyRoutes');

// Import middleware
const { errorHandler } = require('./src/middleware/errorHandler');

// Initialize app
const app = express();

// ⭐ IMPORTANT: Trust proxy for Cloudflare/Render
app.set('trust proxy', 1);
app.set('etag', false);

// ⭐ CORS Configuration - FIXED for Production
const allowedOrigins = [
  process.env.FRONTEND_URL,                    // https://portal.kravixtech.com
  'https://portal.kravixtech.com',             // Custom domain
  'https://e-portal-frontend.vercel.app',      // Vercel default
  'https://e-portal-frontend-openo4dok-kravix-tech-team.vercel.app', // Your Vercel URL
  'http://localhost:3000',                     // Local dev
  'http://localhost:3001',                     // Local dev alternate
  'http://localhost:5173'                      // Vite dev
].filter(Boolean); // Remove any undefined/null values

console.log('🔧 CORS Allowed Origins:', allowedOrigins);

// ⭐ CORS Configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server requests / health checks
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // ⭐ Log blocked origins for debugging
    console.log(`❌ CORS blocked origin: ${origin}`);
    console.log(`✅ Allowed origins: ${allowedOrigins}`);
    
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Cache-Control', 
    'Pragma',
    'Expires',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Headers'
  ],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
}));

// ⭐ Handle preflight OPTIONS requests
app.options('*', cors());

// Cache headers middleware
app.use('/api', (req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  });
  next();
});

const httpServer = createServer(app);

// ⭐ Socket.IO CORS Configuration
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Make io accessible to routes
app.set('io', io);
require('./src/services/notificationService').setIo(io);

// ⭐ Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  }
});

// ⭐ Auth Rate Limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.'
  }
});

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// IP Filter
const { ipFilterMiddleware } = require('./src/middleware/ipFilter');
app.use('/api/', limiter);
app.use('/api', ipFilterMiddleware);

// ⭐ Static files - Consider moving to Supabase Storage
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(path.join(__dirname, 'uploads'))
);

// ⭐ ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/recruitment', recruitmentRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/mailbox', mailboxRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/performance-reviews', performanceReviewRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/help', helpCenterRoutes);
app.use('/api/api-keys', apiKeyRoutes);
app.use('/api/designations', designationRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/backups', backupRoutes);
app.use('/api/ceo', ceoRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/bank-details', bankDetailsRoutes);

// ⭐ Enterprise Portal Routes
app.use('/api/security', securityRoutes);
app.use('/api/employee-services', employeeServicesRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/work-management', workManagementRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/hr-workforce', hrWorkforceRoutes);
app.use('/api/assets', assetsFacilitiesRoutes);
app.use('/api/facilities', assetsFacilitiesRoutes);
app.use('/api/journey', employeeJourneyRoutes);

// ⭐ Apply auth rate limiting to sensitive routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);
app.use('/api/auth/verify-otp', authLimiter);

// ⭐ Health Check endpoint
app.get('/health', async (req, res) => {
  try {
    const { query } = require('./src/config/database');
    await query('SELECT 1');
    res.json({
      status: 'OK',
      database: 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      database: 'disconnected',
      error: error.message
    });
  }
});

// ⭐ Root endpoint - NO DEFAULT CREDENTIALS!
app.get('/', (req, res) => {
  res.json({
    name: 'KRAVIX Enterprise API',
    version: '1.0.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// WebSocket connection handling
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('⚡ New client connected:', socket.id);

  socket.on('authenticate', (userId) => {
    if (!userId) return;
    socket.userId = userId;
    socket.join(`user_${userId}`);

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    console.log(`👤 User ${userId} authenticated on socket ${socket.id}`);
    io.emit('user_status_changed', { userId, online: true });
    socket.emit('online_users_list', Array.from(onlineUsers.keys()));
  });

  socket.on('join_conversation', (conversationId) => {
    if (conversationId) {
      socket.join(`conversation_${conversationId}`);
      console.log(`💬 Socket ${socket.id} joined conversation_${conversationId}`);
    }
  });

  socket.on('leave_conversation', (conversationId) => {
    if (conversationId) {
      socket.leave(`conversation_${conversationId}`);
    }
  });

  socket.on('typing_start', ({ conversationId, userId, userName }) => {
    socket.to(`conversation_${conversationId}`).emit('typing_start', { conversationId, userId, userName });
  });

  socket.on('typing_stop', ({ conversationId, userId }) => {
    socket.to(`conversation_${conversationId}`).emit('typing_stop', { conversationId, userId });
  });

  socket.on('join_department', (departmentId) => {
    socket.join(`dept_${departmentId}`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
    if (socket.userId && onlineUsers.has(socket.userId)) {
      const userSockets = onlineUsers.get(socket.userId);
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        onlineUsers.delete(socket.userId);
        io.emit('user_status_changed', { userId: socket.userId, online: false });
      }
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ⭐ Server startup
const PORT = Number(process.env.PORT) || 10000;
const ALLOW_START_WITHOUT_DB =
  process.env.ALLOW_START_WITHOUT_DB === 'true' ||
  process.env.NODE_ENV === 'development';
let databaseStatus = 'unknown';

const startServer = async () => {
  try {
    await testConnection();
    databaseStatus = 'connected';
    console.log('✅ Database connected successfully');
  } catch (error) {
    databaseStatus = 'unavailable';
    console.error('❌ Failed to connect to database:', error.message);

    if (!ALLOW_START_WITHOUT_DB) {
      console.error('❌ Database connection required. Exiting...');
      process.exit(1);
    }

    console.warn(
      '⚠️ Starting server without database connectivity because ALLOW_START_WITHOUT_DB=true'
    );
  }

  if (databaseStatus === 'connected') {
    try {
      const { startInactivityMonitor } = require('./src/services/inactivityMonitor');
      startInactivityMonitor(60000, 20);
    } catch (monErr) {
      console.warn('⚠️ Failed to start inactivity monitor:', monErr.message);
    }

    try {
      const cron = require('node-cron');
      const reportAutomationService = require('./src/services/reportAutomationService');
      cron.schedule('0 * * * *', async () => {
        try {
          console.log('⏰ [Cron Worker] Running hourly scheduled reports check...');
          await reportAutomationService.processDueScheduledReports();
        } catch (cronErr) {
          console.error('❌ [Cron Worker] Error:', cronErr.message);
        }
      });
      console.log('⏰ Report automation cron scheduler initialized (runs hourly).');
    } catch (cronInitErr) {
      console.warn('⚠️ Failed to start report automation cron scheduler:', cronInitErr.message);
    }
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Database status: ${databaseStatus}`);
    console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'Not set'}`);
    console.log(`📋 Allowed CORS origins:`, allowedOrigins);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = { app, io, startServer };