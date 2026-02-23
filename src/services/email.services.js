require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Generic function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Bank-Backend" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error.message);
    return false;
  }
};

// ✅ Professional Registration Email
async function sendRegistrationEmail(userEmail, name) {
  const subject = "Welcome to Bank-Backend";

  const text = `Dear ${name},

Welcome to Bank-Backend.

Your account has been successfully created. You can now securely access our services and manage your transactions.

If you did not create this account, please contact our support team immediately.

Regards,  
Bank-Backend Support Team`;

  const html = `
  <div style="background:#f4f6f8; padding:24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
      <tr>
        <td style="background:#0f2a44;padding:16px 24px;color:#ffffff;">
          <h2 style="margin:0;font-family:Arial, sans-serif;">🏦 Bank-Backend</h2>
          <p style="margin:4px 0 0;font-size:12px;opacity:0.9;">Secure Digital Banking</p>
        </td>
      </tr>

      <tr>
        <td style="padding:24px;font-family:Arial, sans-serif;color:#333;">
          <h3 style="margin-top:0;">Welcome, ${name} 👋</h3>

          <p>Your account has been successfully created with <b>Bank-Backend</b>.</p>

          <div style="background:#f0f4ff;border-left:4px solid #0f2a44;padding:12px 16px;border-radius:4px;margin:16px 0;">
            You can now securely access your account, manage balances, and perform transactions.
          </div>

          <p style="font-size:14px;color:#555;">
            If you did not create this account, please contact our support team immediately.
          </p>

          <p style="margin-top:24px;">
            Regards,<br/>
            <b>Bank-Backend Support Team</b>
          </p>
        </td>
      </tr>

      <tr>
        <td style="background:#f4f6f8;padding:16px 24px;font-family:Arial, sans-serif;font-size:12px;color:#777;">
          This is an automated message. Please do not reply.<br/>
          © ${new Date().getFullYear()} Bank-Backend. All rights reserved.
        </td>
      </tr>
    </table>
  </div>
`;

  return await sendEmail(userEmail, subject, text, html);
}

// ✅ Transaction Success Email (like reference)
async function sendTransactionEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Successful ✅";

  const text = `Hi ${name},

Your transaction of ₹${amount} to account ${toAccount} was successful.

Thank you for using Bank-Backend.
Bank-Backend Team`;

  const html = `
  <div style="background:#eef3f7; padding:24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
      <tr>
        <td style="background:#0a7f42;padding:16px 24px;color:#ffffff;">
          <h2 style="margin:0;font-family:Arial, sans-serif;">Transaction Successful</h2>
        </td>
      </tr>

      <tr>
        <td style="padding:24px;font-family:Arial, sans-serif;color:#333;">
          <p>Dear ${name},</p>

          <p>Your transaction has been completed successfully.</p>

          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr>
              <td style="padding:8px;border:1px solid #ddd;"><b>Amount</b></td>
              <td style="padding:8px;border:1px solid #ddd;">₹${amount}</td>
            </tr>
            <tr>
              <td style="padding:8px;border:1px solid #ddd;"><b>To Account</b></td>
              <td style="padding:8px;border:1px solid #ddd;">${toAccount}</td>
            </tr>
            <tr>
              <td style="padding:8px;border:1px solid #ddd;"><b>Status</b></td>
              <td style="padding:8px;border:1px solid #ddd;color:#0a7f42;"><b>COMPLETED</b></td>
            </tr>
          </table>

          <p style="font-size:14px;color:#555;">
            If you did not authorize this transaction, please contact support immediately.
          </p>

          <p style="margin-top:24px;">
            Thank you for banking with us.<br/>
            <b>Bank-Backend Team</b>
          </p>
        </td>
      </tr>

      <tr>
        <td style="background:#f4f6f8;padding:16px 24px;font-family:Arial, sans-serif;font-size:12px;color:#777;">
          This is an automated message. Please do not reply.<br/>
          © ${new Date().getFullYear()} Bank-Backend.
        </td>
      </tr>
    </table>
  </div>
`;

  return await sendEmail(userEmail, subject, text, html);
}

// ❌ Transaction Failed Email (like reference)
async function sendTransactionFailureEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Failed ❌";

  const text = `Hi ${name},

Unfortunately, your transaction of ₹${amount} to account ${toAccount} has failed.
Please try again later.

Bank-Backend Team`;

  const html = `
  <div style="background:#fff1f1; padding:24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
      <tr>
        <td style="background:#c62828;padding:16px 24px;color:#ffffff;">
          <h2 style="margin:0;font-family:Arial, sans-serif;">Transaction Failed</h2>
        </td>
      </tr>

      <tr>
        <td style="padding:24px;font-family:Arial, sans-serif;color:#333;">
          <p>Dear ${name},</p>

          <p>Unfortunately, your transaction could not be completed.</p>

          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr>
              <td style="padding:8px;border:1px solid #ddd;"><b>Amount</b></td>
              <td style="padding:8px;border:1px solid #ddd;">₹${amount}</td>
            </tr>
            <tr>
              <td style="padding:8px;border:1px solid #ddd;"><b>To Account</b></td>
              <td style="padding:8px;border:1px solid #ddd;">${toAccount}</td>
            </tr>
            <tr>
              <td style="padding:8px;border:1px solid #ddd;"><b>Status</b></td>
              <td style="padding:8px;border:1px solid #ddd;color:#c62828;"><b>FAILED</b></td>
            </tr>
          </table>

          <p style="font-size:14px;color:#555;">
            Please try again later or contact support if the issue persists.
          </p>

          <p style="margin-top:24px;">
            Regards,<br/>
            <b>Bank-Backend Support Team</b>
          </p>
        </td>
      </tr>

      <tr>
        <td style="background:#f4f6f8;padding:16px 24px;font-family:Arial, sans-serif;font-size:12px;color:#777;">
          This is an automated message. Do not share OTPs or credentials with anyone.<br/>
          © ${new Date().getFullYear()} Bank-Backend.
        </td>
      </tr>
    </table>
  </div>
`;

  return await sendEmail(userEmail, subject, text, html);
}

module.exports = {
  sendEmail,
  sendRegistrationEmail,
  sendTransactionEmail,
  sendTransactionFailureEmail,
};
