// One-off check: verifies Gmail SMTP credentials without sending mail.
import 'dotenv/config';
import nodemailer from 'nodemailer';

const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.SMTP_EMAIL, pass: process.env.SMTP_APP_PASSWORD },
});

try {
  await transport.verify();
  console.log('SMTP_OK: credentials valid, ready to send');
} catch (err) {
  console.error('SMTP_FAIL:', err.message);
  process.exitCode = 1;
} finally {
  process.exit(0);
}
