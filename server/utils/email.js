const nodemailer = require('nodemailer');
require('dotenv').config()

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false  // ← to be removed in the produciton phase
  }
})

const sendVerificationEmail = async(toEmail, verificationToken, username) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  await transporter.sendMail({
    from: '"CodeDash" <noreply@codedash.com>',
    to: toEmail,
    text: `Hi ${username}, paste this link in your browser to verify your account: ${verificationUrl} This link expires in 24 hours.`,
    html: `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
        <h2>Welcome to CodeDash, ${username}!</h2>
        <p>Click the button below to verify your email address.</p>
        <a href="${verificationUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Verify Email Address
        </a>
        <p style="margin-top: 24px; color: #94a3b8; font-size: 14px;">
          This link expires in 24 hours. If you didn't sign up for CodeDash, ignore this email.
        </p>
      </div>
    `
  })
}


const sendPasswordResetEmail = async (toEmail, resetToken, username) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  await transporter.sendMail({
    from: '"CodeDash" <noreply@codedash.com',
    to: toEmail,
    text: `Hi ${username}, paste this link in your browser to reset your password: ${resetUrl}`,
    html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
            <h2>Reset your CodeDash password</h2>
            <p>Hi ${username}, click the button below to choose a new password.</p>
            <a href="${resetUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Reset Password
            </a>
            <p style="margin-top: 24px; color: #94a3b8; font-size: 14px;">
              This link expires in 1 hour. If you didn't request this, ignore this email.
            </p>
        </div>
        `

  })
}
module.exports = {sendVerificationEmail, sendPasswordResetEmail}
