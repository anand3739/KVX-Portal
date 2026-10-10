const nodemailer = require('nodemailer');

let cachedTransporter = null;

const getTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;

  const isPlaceholder = !SMTP_USER ||
    SMTP_USER.includes('your-email') ||
    SMTP_USER.includes('example.com') ||
    !SMTP_PASSWORD ||
    SMTP_PASSWORD.includes('your-app-password');

  if (!isPlaceholder && SMTP_HOST) {
    try {
      const port = parseInt(SMTP_PORT) || 587;
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: port,
        secure: port === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASSWORD
        }
      });
      await transporter.verify();
      cachedTransporter = transporter;
      return cachedTransporter;
    } catch (err) {
      console.warn('⚠️ Configured SMTP failed verification, falling back to test account:', err.message);
    }
  }

  // Fallback to Ethereal SMTP test account in dev/test when SMTP is placeholder or failing
  console.log('ℹ️ Initializing Ethereal SMTP test account for email delivery...');
  const testAccount = await nodemailer.createTestAccount();
  cachedTransporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
  console.log(`✅ Ethereal test mailer ready (${testAccount.user})`);
  return cachedTransporter;
};

const sendWelcomeEmail = async (email, name, tempPassword, employeeId) => {
  const mailOptions = {
    from: '"KRAVIX Portal" <noreply@kravixtech.com>',
    to: email,
    subject: 'Welcome to KRAVIX Portal',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Welcome to KRAVIX</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your account has been created in the KRAVIX Enterprise Portal.</p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Employee ID:</strong> ${employeeId}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> <code style="background: #f0f0f0; padding: 5px;">${tempPassword}</code></p>
          </div>
          
          <p>Please login and change your password immediately.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/login" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
              Login to Portal
            </a>
          </div>
          
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
            This is an automated message, please do not reply.
          </p>
        </div>
      </div>
    `
  };

  const tr = await getTransporter();
  await tr.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, name, token) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: '"KRAVIX Portal" <noreply@kravixtech.com>',
    to: email,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Password Reset</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Hello <strong>${name}</strong>,</p>
          <p>We received a request to reset your password.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
              Reset Password
            </a>
          </div>
          
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
            This is an automated message, please do not reply.
          </p>
        </div>
      </div>
    `
  };

  const tr = await getTransporter();
  await tr.sendMail(mailOptions);
};

const sendPayslipEmail = async (email, name, month, year, payslipUrl) => {
  const mailOptions = {
    from: '"KRAVIX Portal" <noreply@kravixtech.com>',
    to: email,
    subject: `Payslip for ${month}/${year}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Payslip Generated</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your payslip for <strong>${month}/${year}</strong> is now available.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${payslipUrl}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
              Download Payslip
            </a>
          </div>
          
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
            This is an automated message, please do not reply.
          </p>
        </div>
      </div>
    `
  };

  const tr = await getTransporter();
  await tr.sendMail(mailOptions);
};

const sendPayslipEmailWithAttachment = async ({ to, subject, html, attachments }) => {
  const tr = await getTransporter();
  const mailOptions = {
    from: '"KVX HR Portal" <noreply@kvx.com>',
    to,
    subject,
    html,
    attachments
  };
  const info = await tr.sendMail(mailOptions);
  if (nodemailer.getTestMessageUrl && nodemailer.getTestMessageUrl(info)) {
    console.log(`✉️ Email preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  }
  return info;
};

module.exports = {
  getTransporter,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPayslipEmail,
  sendPayslipEmailWithAttachment
};