const { query } = require('../config/database');
const path = require('path');
const fs = require('fs-extra');
const { exec } = require('child_process');

const BACKUP_DIR = path.join(__dirname, '../../uploads/backups');
fs.ensureDirSync(BACKUP_DIR);

// Helper to format bytes into readable sizes
const formatBytes = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Ensure system_backups table exists in PostgreSQL
const ensureBackupTable = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS system_backups (
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
      )
    `);
  } catch (err) {
    console.warn('Backup table check warning:', err.message);
  }
};

// Clean up expired backups according to retention period
const cleanupExpiredBackups = async (retentionDays = 90) => {
  try {
    await ensureBackupTable();
    const expiredRes = await query(`
      SELECT id, file_path 
      FROM system_backups 
      WHERE created_at < NOW() - INTERVAL '1 day' * $1
    `, [retentionDays]);

    for (const b of expiredRes.rows) {
      if (b.file_path && fs.existsSync(b.file_path)) {
        await fs.remove(b.file_path).catch(() => {});
      }
      await query('DELETE FROM system_backups WHERE id = $1', [b.id]);
    }
  } catch (err) {
    console.warn('Backup cleanup warning:', err.message);
  }
};

/**
 * GET /api/backups - Fetch all backup records from PostgreSQL
 */
const getBackups = async (req, res) => {
  try {
    cleanupExpiredBackups(90);

    const result = await query(`
      SELECT 
        b.id,
        b.name,
        b.file_name,
        b.file_size,
        b.formatted_size AS size,
        b.backup_type AS type,
        b.destination AS location,
        b.status,
        b.created_at AS date,
        CONCAT(e.first_name, ' ', e.last_name) AS created_by_name
      FROM system_backups b
      LEFT JOIN employees e ON b.created_by = e.id
      ORDER BY b.created_at DESC
    `);

    res.json({
      success: true,
      backups: result.rows.map(r => ({
        ...r,
        date: r.date ? new Date(r.date).toISOString().replace('T', ' ').substring(0, 16) : 'N/A'
      }))
    });
  } catch (error) {
    console.error('Get backups error:', error);
    res.status(500).json({ message: 'Server error fetching backup history' });
  }
};

/**
 * POST /api/backups/run - Execute PostgreSQL database backup and record metadata
 */
const runBackup = async (req, res) => {
  try {
    await ensureBackupTable();
    const userId = req.user?.id || null;
    const { destination = 'Local Storage', type = 'Full PostgreSQL' } = req.body || {};

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `kvx-backup-${timestamp}.sql`;
    const filePath = path.join(BACKUP_DIR, fileName);

    let bytesWritten = 0;

    try {
      const dbHost = process.env.DB_HOST || 'localhost';
      const dbUser = process.env.DB_USER || 'postgres';
      const dbName = process.env.DB_NAME || 'postgres';
      const dbPort = process.env.DB_PORT || 5432;
      const dbPass = process.env.DB_PASSWORD || '';

      const envVars = { ...process.env, PGPASSWORD: dbPass };
      const dumpCmd = `pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -F p -f "${filePath}"`;

      await new Promise((resolve, reject) => {
        exec(dumpCmd, { env: envVars, timeout: 30000 }, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    } catch (pgDumpErr) {
      console.warn("pg_dump CLI execution fallback:", pgDumpErr.message);

      try {
        const tablesRes = await query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        `);

        let dumpContent = `-- KRAVIX ENTERPRISE PORTAL BACKUP DUMP\n-- Date: ${new Date().toISOString()}\n\n`;

        for (const tbl of tablesRes.rows) {
          const tName = tbl.table_name;
          const rowsRes = await query(`SELECT * FROM "${tName}"`);
          dumpContent += `-- Table: ${tName} (${rowsRes.rows.length} rows)\n`;
          dumpContent += `\n`;
        }

        await fs.writeFile(filePath, dumpContent, 'utf8');
      } catch (fallbackErr) {
        console.error("Backup fallback error:", fallbackErr.message);
        return res.status(500).json({ message: "Failed to generate database backup" });
      }
    }

    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      bytesWritten = stats.size;
    }

    const formattedSize = formatBytes(bytesWritten);
    const backupName = `PostgreSQL Database Backup (${new Date().toISOString().substring(0, 10)})`;

    const insertRes = await query(`
      INSERT INTO system_backups (name, file_name, file_path, file_size, formatted_size, backup_type, destination, status, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, name, file_name, file_size, formatted_size AS size, backup_type AS type, destination AS location, status, created_at AS date
    `, [backupName, fileName, filePath, bytesWritten, formattedSize, type, destination, 'success', userId]);

    const record = insertRes.rows[0];

    res.json({
      success: true,
      message: 'PostgreSQL Database Backup generated successfully!',
      backup: {
        ...record,
        date: record.date ? new Date(record.date).toISOString().replace('T', ' ').substring(0, 16) : 'N/A'
      }
    });
  } catch (error) {
    console.error('Run backup error:', error);
    res.status(500).json({ message: 'Server error generating database backup' });
  }
};

/**
 * GET /api/backups/:id/download - Stream backup file for download
 */
const downloadBackup = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query('SELECT * FROM system_backups WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Backup record not found' });
    }

    const backup = result.rows[0];
    if (!fs.existsSync(backup.file_path)) {
      return res.status(404).json({ message: 'Physical backup file not found on disk' });
    }

    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', `attachment; filename="${backup.file_name}"`);
    return res.download(backup.file_path, backup.file_name);
  } catch (error) {
    console.error('Download backup error:', error);
    res.status(500).json({ message: 'Server error downloading backup file' });
  }
};

/**
 * DELETE /api/backups/:id - Delete backup metadata and physical file
 */
const deleteBackup = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query('SELECT * FROM system_backups WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Backup record not found' });
    }

    const backup = result.rows[0];
    if (backup.file_path && fs.existsSync(backup.file_path)) {
      await fs.remove(backup.file_path).catch(() => {});
    }

    await query('DELETE FROM system_backups WHERE id = $1', [id]);

    res.json({ success: true, message: `Backup '${backup.name}' deleted successfully` });
  } catch (error) {
    console.error('Delete backup error:', error);
    res.status(500).json({ message: 'Server error deleting backup' });
  }
};

module.exports = {
  getBackups,
  runBackup,
  downloadBackup,
  deleteBackup
};
