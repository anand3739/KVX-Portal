const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// ⭐ Database Pool Configuration (supports DATABASE_URL or discrete DB_* env variables)
const getPoolConfig = () => {
  const sslConfig = { rejectUnauthorized: false };

  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: sslConfig,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
      keepAlive: true,
    };
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'false' ? false : sslConfig,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
    keepAlive: true,
  };
};

const pool = new Pool(getPoolConfig());

// Handle idle client connection drops gracefully
pool.on('error', (err) => {
  console.warn('⚠️ [PostgreSQL Pool Warning] Idle client connection drop / reset:', err.message);
});

// Auto-initialize chat system database tables
const initChatTables = async () => {
  const bootstrapStatements = [
    `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,
  ];

  const createStatements = [
    `CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        type VARCHAR(50) NOT NULL DEFAULT 'direct',
        name VARCHAR(255),
        image_url TEXT,
        created_by UUID REFERENCES employees(id) ON DELETE SET NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS conversation_members (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
        employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'member',
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_read_message UUID,
        is_muted BOOLEAN DEFAULT false,
        is_pinned BOOLEAN DEFAULT false,
        UNIQUE(conversation_id, employee_id)
    )`,
    `CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id UUID REFERENCES employees(id) ON DELETE CASCADE,
        message TEXT,
        attachments JSONB DEFAULT '[]'::jsonb,
        parent_message_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
        reactions JSONB DEFAULT '{}'::jsonb,
        is_edited BOOLEAN DEFAULT false,
        is_deleted BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS user_settings (
        user_id UUID PRIMARY KEY REFERENCES employees(id) ON DELETE CASCADE,
        preferences JSONB DEFAULT '{}'::jsonb,
        notification_settings JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS company_settings (
        id BOOLEAN PRIMARY KEY DEFAULT true,
        settings JSONB DEFAULT '{}'::jsonb,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS system_settings (
        id BOOLEAN PRIMARY KEY DEFAULT true,
        settings JSONB DEFAULT '{}'::jsonb,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS reminders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES employees(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        due_date TIMESTAMP WITH TIME ZONE NOT NULL,
        priority VARCHAR(50) DEFAULT 'medium',
        completed BOOLEAN DEFAULT false,
        completed_at TIMESTAMP WITH TIME ZONE,
        event_time TIMESTAMP WITH TIME ZONE,
        remind_offset_minutes INT DEFAULT 5,
        notify_email BOOLEAN DEFAULT true,
        notify_whatsapp BOOLEAN DEFAULT false,
        email VARCHAR(255),
        whatsapp VARCHAR(50),
        triggered BOOLEAN DEFAULT false,
        triggered_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS task_comments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
        user_id UUID REFERENCES employees(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_work_note BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS task_attachments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
        uploaded_by UUID REFERENCES employees(id) ON DELETE SET NULL,
        file_name VARCHAR(255) NOT NULL,
        file_url TEXT NOT NULL,
        file_size INT,
        mime_type VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS training_courses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100) DEFAULT 'General',
        instructor VARCHAR(255),
        duration_hours DECIMAL(5,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft', 'archived', 'completed')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    `ALTER TABLE training_courses ADD COLUMN IF NOT EXISTS instructor VARCHAR(255)`,
    `ALTER TABLE training_courses DROP CONSTRAINT IF EXISTS training_courses_status_check`,
    `ALTER TABLE training_courses ADD CONSTRAINT training_courses_status_check CHECK (status IN ('active', 'inactive', 'draft', 'archived', 'completed'))`,
    `ALTER TABLE payroll ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT false`,
    `ALTER TABLE payroll ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP WITH TIME ZONE`,
    `ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_category_check`,
    `CREATE TABLE IF NOT EXISTS training_enrollments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        course_id UUID REFERENCES training_courses(id) ON DELETE CASCADE,
        employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in-progress', 'completed', 'dropped')),
        progress INT DEFAULT 0,
        enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(course_id, employee_id)
    )`,
    `CREATE TABLE IF NOT EXISTS announcements (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(100) DEFAULT 'General',
        priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
        audience VARCHAR(100) DEFAULT 'All Employees',
        status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
        pinned BOOLEAN DEFAULT false,
        author_id UUID REFERENCES employees(id) ON DELETE SET NULL,
        author_name VARCHAR(200),
        scheduled_at TIMESTAMP WITH TIME ZONE,
        published_at TIMESTAMP WITH TIME ZONE,
        views INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES employees(id) ON DELETE SET NULL,
        user_email VARCHAR(255),
        user_role VARCHAR(50),
        action VARCHAR(255) NOT NULL,
        resource VARCHAR(100),
        resource_id VARCHAR(255),
        details JSONB DEFAULT '{}'::jsonb,
        ip_address VARCHAR(50),
        user_agent TEXT,
        status VARCHAR(50) DEFAULT 'success' CHECK (status IN ('success', 'failure', 'warning')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS system_backups (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        file_size BIGINT DEFAULT 0,
        formatted_size VARCHAR(50) DEFAULT '0 B',
        backup_type VARCHAR(50) DEFAULT 'Full PostgreSQL',
        destination VARCHAR(100) DEFAULT 'Local Storage',
        status VARCHAR(50) DEFAULT 'success',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by UUID REFERENCES employees(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        sender_id UUID REFERENCES employees(id) ON DELETE CASCADE,
        recipient_id UUID REFERENCES employees(id) ON DELETE CASCADE,
        subject VARCHAR(255),
        content TEXT,
        attachments JSONB DEFAULT '[]'::jsonb,
        read BOOLEAN DEFAULT false,
        read_at TIMESTAMP WITH TIME ZONE,
        parent_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
        is_starred BOOLEAN DEFAULT false,
        is_archived BOOLEAN DEFAULT false,
        is_deleted BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS mailbox_drafts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES employees(id) ON DELETE CASCADE,
        recipient_id UUID REFERENCES employees(id) ON DELETE SET NULL,
        subject VARCHAR(255) DEFAULT '',
        content TEXT DEFAULT '',
        attachments JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`
  ];

  const alterStatements = [
    `ALTER TABLE conversations ADD COLUMN IF NOT EXISTS image_url TEXT`,
    `ALTER TABLE conversations ADD COLUMN IF NOT EXISTS name VARCHAR(255)`,
    `ALTER TABLE conversations ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES employees(id) ON DELETE SET NULL`,
    `ALTER TABLE conversations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true`,
    `ALTER TABLE conversations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`,
    `ALTER TABLE conversation_members ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'member'`,
    `ALTER TABLE conversation_members ADD COLUMN IF NOT EXISTS last_read_message UUID`,
    `ALTER TABLE conversation_members ADD COLUMN IF NOT EXISTS is_muted BOOLEAN DEFAULT false`,
    `ALTER TABLE conversation_members ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false`,
    `ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb`,
    `ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS parent_message_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL`,
    `ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}'::jsonb`,
    `ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false`,
    `ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false`,
    `ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`,
    `ALTER TABLE reminders ADD COLUMN IF NOT EXISTS event_time TIMESTAMP WITH TIME ZONE`,
    `ALTER TABLE reminders ADD COLUMN IF NOT EXISTS remind_offset_minutes INT DEFAULT 5`,
    `ALTER TABLE reminders ADD COLUMN IF NOT EXISTS notify_email BOOLEAN DEFAULT true`,
    `ALTER TABLE reminders ADD COLUMN IF NOT EXISTS notify_whatsapp BOOLEAN DEFAULT false`,
    `ALTER TABLE reminders ADD COLUMN IF NOT EXISTS email VARCHAR(255)`,
    `ALTER TABLE reminders ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(50)`,
    `ALTER TABLE reminders ADD COLUMN IF NOT EXISTS triggered BOOLEAN DEFAULT false`,
    `ALTER TABLE reminders ADD COLUMN IF NOT EXISTS triggered_at TIMESTAMP WITH TIME ZONE`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS bio TEXT`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS linkedin VARCHAR(255)`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS twitter VARCHAR(255)`,
    `ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb`,
    `ALTER TABLE messages ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false`,
    `ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE`,
    `ALTER TABLE messages ADD COLUMN IF NOT EXISTS parent_message_id UUID REFERENCES messages(id) ON DELETE SET NULL`,
    `ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT false`,
    `ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false`,
    `ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false`,
    `ALTER TABLE mailbox_drafts ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb`
  ];

  const indexStatements = [
    `CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_conversation_members_emp ON conversation_members(employee_id)`,
    `CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON chat_messages(conversation_id, created_at ASC)`,
    `CREATE INDEX IF NOT EXISTS idx_messages_recip_read ON messages(recipient_id, read, is_deleted, is_archived)`,
    `CREATE INDEX IF NOT EXISTS idx_mailbox_drafts_user ON mailbox_drafts(user_id)`
  ];

  const allStatements = [...bootstrapStatements, ...createStatements, ...alterStatements, ...indexStatements];

  let successCount = 0;
  for (const sql of allStatements) {
    try {
      await pool.query(sql);
      successCount++;
    } catch (err) {
      if (!err.message.includes('already exists') && !err.message.includes('duplicate column')) {
        console.error('⚠️ Chat init warning:', err.message.substring(0, 120));
      }
    }
  }
  console.log(`💬 Enterprise Chat tables initialized (${successCount}/${allStatements.length} statements OK)`);
};

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Supabase Cloud Database connected successfully');
    client.release();
    await initChatTables();
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error.message);
    throw error;
  }
};

const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.log('📝 Slow query:', { duration: duration + 'ms', rows: result.rowCount });
    }
    return result;
  } catch (error) {
    console.error('❌ Query error:', error.message);
    throw error;
  }
};

const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  query,
  transaction,
  testConnection,
  initChatTables
};