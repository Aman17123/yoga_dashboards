import nodemailer from "nodemailer";

// ─── Transporter ────────────────────────────────────────────────────────────
function createTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (
    !user ||
    !pass ||
    user === "your-gmail@gmail.com" ||
    pass === "your-16-char-app-password" ||
    user.includes("example.com")
  ) {
    return null; // Email not configured — will log instead
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user.trim(),
      pass: pass.trim(),
    },
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const DAY_LABELS = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

function formatDays(days = []) {
  if (!days.length) return "Flexible";
  return days.map((d) => DAY_LABELS[d] || d).join(", ");
}

function classTypeLabel(ct) {
  if (ct === "private") return "Private (1-to-1)";
  if (ct === "group") return "Group Cohort";
  return "Not sure yet";
}

// ─── Email Styles (shared) ────────────────────────────────────────────────────
const BASE_STYLES = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
    body { margin:0; padding:0; background:#F6F7FB; font-family:'Inter',sans-serif; -webkit-font-smoothing:antialiased; }
    .wrap { max-width:580px; margin:32px auto; background:#fff; border-radius:20px; border:1px solid #E3E6F2; overflow:hidden; }
    .header { background:linear-gradient(135deg,#4C5FD5 0%,#6B7FEB 100%); padding:32px 36px; }
    .brand { display:flex; align-items:center; gap:10px; margin-bottom:20px; }
    .brand-icon { width:32px; height:32px; }
    .brand-name { font-family:'Space Grotesk',sans-serif; font-size:20px; font-weight:700; color:#fff; letter-spacing:-0.02em; }
    .header h1 { font-family:'Space Grotesk',sans-serif; font-size:26px; font-weight:700; color:#fff; margin:0 0 8px; letter-spacing:-0.02em; }
    .header p { font-size:15px; color:rgba(255,255,255,0.82); margin:0; line-height:1.5; }
    .body { padding:32px 36px; }
    .body p { font-size:15px; color:#4B5264; line-height:1.65; margin:0 0 16px; }
    .body p:last-child { margin-bottom:0; }
    .card { background:#F6F7FB; border-radius:14px; border:1px solid #E3E6F2; padding:22px 24px; margin:22px 0; }
    .card-title { font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#A3A8C3; margin:0 0 14px; }
    .row { display:flex; justify-content:space-between; align-items:flex-start; padding:10px 0; border-bottom:1px solid #E3E6F2; gap:12px; }
    .row:last-child { border-bottom:none; }
    .label { font-size:13px; color:#6B7089; font-weight:500; flex-shrink:0; min-width:130px; }
    .value { font-size:13px; color:#171A32; font-weight:600; text-align:right; }
    .ref-badge { display:inline-block; background:#EEF0FA; color:#4C5FD5; font-family:monospace; font-size:14px; font-weight:700; padding:6px 14px; border-radius:8px; letter-spacing:0.06em; margin:4px 0 16px; }
    .steps { list-style:none; margin:0; padding:0; }
    .steps li { display:flex; align-items:flex-start; gap:14px; padding:12px 0; border-bottom:1px solid #E3E6F2; }
    .steps li:last-child { border-bottom:none; }
    .step-num { width:26px; height:26px; border-radius:50%; background:#4C5FD5; color:#fff; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; flex-shrink:0; }
    .step-text { font-size:13.5px; color:#4B5264; line-height:1.5; padding-top:3px; }
    .btn-wrap { text-align:center; margin:28px 0 8px; }
    .btn { display:inline-block; background:#4C5FD5; color:#fff; font-family:'Space Grotesk',sans-serif; font-size:15px; font-weight:700; padding:14px 36px; border-radius:12px; text-decoration:none; letter-spacing:-0.01em; }
    .footer { padding:22px 36px; border-top:1px solid #E3E6F2; text-align:center; }
    .footer p { font-size:12px; color:#A3A8C3; margin:0; line-height:1.6; }
    .sun-path { fill:none; stroke:#F2994A; stroke-width:1.5; }
    .sun-center { fill:#F2994A; }
  </style>
`;

const SUN_SVG = `
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="brand-icon">
  <circle cx="16" cy="16" r="5" class="sun-center"/>
  <circle cx="16" cy="16" r="10" class="sun-path" stroke-dasharray="3 2.5"/>
  <path d="M16 3v3M16 26v3M3 16h3M26 16h3M6.5 6.5l2 2M23.5 23.5l2 2M23.5 6.5l-2 2M6.5 23.5l2-2" stroke="#F2994A" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

// ─── User Confirmation Email ─────────────────────────────────────────────────
export function buildUserEmailHTML(booking) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">${BASE_STYLES}</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="brand">${SUN_SVG}<span class="brand-name">yogaonlive</span></div>
    <h1>Your booking is confirmed 🎉</h1>
    <p>We've received your request and our team will reach out to you within 24 hours.</p>
  </div>
  <div class="body">
    <p>Hi <strong>${booking.name.split(" ")[0]}</strong>,</p>
    <p>Thank you for choosing yogaonlive. We're excited to begin this journey with you! Your booking request has been received and assigned a reference number:</p>
    <div class="ref-badge">${booking.bookingRef}</div>

    <div class="card">
      <div class="card-title">Your Booking Details</div>
      <div class="row"><span class="label">Name</span><span class="value">${booking.name}</span></div>
      <div class="row"><span class="label">Email</span><span class="value">${booking.email}</span></div>
      ${booking.phone ? `<div class="row"><span class="label">WhatsApp / Phone</span><span class="value">${booking.phone}</span></div>` : ""}
      ${booking.age ? `<div class="row"><span class="label">Age</span><span class="value">${booking.age} years</span></div>` : ""}
      ${booking.gender ? `<div class="row"><span class="label">Gender</span><span class="value">${booking.gender}</span></div>` : ""}
      ${booking.country ? `<div class="row"><span class="label">Country</span><span class="value">${booking.country}</span></div>` : ""}
      <div class="row"><span class="label">Class Preference</span><span class="value">${classTypeLabel(booking.classType)}</span></div>
      ${booking.groupCohort ? `<div class="row"><span class="label">Selected Cohort</span><span class="value">${booking.groupCohort}</span></div>` : ""}
      ${booking.preferredTime ? `<div class="row"><span class="label">Preferred Time (IST)</span><span class="value">${booking.preferredTime}</span></div>` : ""}
      ${booking.preferredTime2 ? `<div class="row"><span class="label">Secondary Slot</span><span class="value">${booking.preferredTime2}</span></div>` : ""}
      ${booking.joiningDate ? `<div class="row"><span class="label">Trial / Joining Date</span><span class="value">${booking.joiningDate}</span></div>` : ""}
      ${booking.language ? `<div class="row"><span class="label">Language</span><span class="value">${booking.language}</span></div>` : ""}
    </div>

    <div class="card">
      <div class="card-title">What Happens Next?</div>
      <ul class="steps">
        <li><div class="step-num">1</div><div class="step-text"><strong>Review (within 24h)</strong> — Our team will review your preferences and match you with the best certified instructor.</div></li>
        <li><div class="step-num">2</div><div class="step-text"><strong>Personal outreach</strong> — We'll contact you via WhatsApp or email to confirm your trial slot.</div></li>
        <li><div class="step-num">3</div><div class="step-text"><strong>Trial session</strong> — Experience a complimentary live trial class with real-time posture guidance.</div></li>
        <li><div class="step-num">4</div><div class="step-text"><strong>Enroll</strong> — Enjoy practicing consistently with our live online yoga family!</div></li>
      </ul>
    </div>

    <p>If you have any immediate questions, simply reply to this email and we'll get back to you promptly.</p>
    <p>Namaste 🙏<br><strong>The yogaonlive Team</strong></p>
  </div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} yogaonlive · Online Yoga Studio<br>
    You received this email because you submitted a booking request on our website.<br>
    Booking Reference: <strong>${booking.bookingRef}</strong></p>
  </div>
</div>
</body></html>`;
}

// ─── Admin Notification Email ────────────────────────────────────────────────
export function buildAdminEmailHTML(booking) {
  const submittedAt = new Date(booking.createdAt || Date.now()).toLocaleString(
    "en-IN",
    { timeZone: "Asia/Kolkata", dateStyle: "full", timeStyle: "short" }
  );

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">${BASE_STYLES}</head>
<body>
<div class="wrap">
  <div class="header" style="background:linear-gradient(135deg,#1E9E63 0%,#27b77a 100%);">
    <div class="brand">${SUN_SVG}<span class="brand-name">yogaonlive</span></div>
    <h1>New Booking Received 🔔</h1>
    <p>A new student booking request has been submitted via <strong>${booking.source || "yogaonlive"}</strong>.</p>
  </div>
  <div class="body">
    <p>A new student booking has come in. Here are the full details:</p>

    <div class="card">
      <div class="card-title">Booking Reference &amp; Meta</div>
      <div class="row"><span class="label">Booking Ref</span><span class="value" style="color:#4C5FD5;font-family:monospace">${booking.bookingRef}</span></div>
      <div class="row"><span class="label">Submitted</span><span class="value">${submittedAt}</span></div>
      <div class="row"><span class="label">Source</span><span class="value">${booking.source || "Direct"}</span></div>
      ${booking.referralUrl ? `<div class="row"><span class="label">Referral URL</span><span class="value" style="font-size:11px;word-break:break-all">${booking.referralUrl}</span></div>` : ""}
    </div>

    <div class="card">
      <div class="card-title">Student Information</div>
      <div class="row"><span class="label">Full Name</span><span class="value">${booking.name}</span></div>
      <div class="row"><span class="label">Email</span><span class="value">${booking.email}</span></div>
      ${booking.phone ? `<div class="row"><span class="label">WhatsApp / Phone</span><span class="value">${booking.phone}</span></div>` : ""}
      ${booking.age ? `<div class="row"><span class="label">Age</span><span class="value">${booking.age} years</span></div>` : ""}
      ${booking.gender ? `<div class="row"><span class="label">Gender</span><span class="value">${booking.gender}</span></div>` : ""}
      ${booking.country ? `<div class="row"><span class="label">Country</span><span class="value">${booking.country}</span></div>` : ""}
      ${booking.timezone ? `<div class="row"><span class="label">Timezone</span><span class="value">${booking.timezone}</span></div>` : ""}
    </div>

    <div class="card">
      <div class="card-title">Class Preferences</div>
      <div class="row"><span class="label">Class Type</span><span class="value">${classTypeLabel(booking.classType)}</span></div>
      ${booking.groupCohort ? `<div class="row"><span class="label">Cohort</span><span class="value">${booking.groupCohort}</span></div>` : ""}
      ${booking.fee ? `<div class="row"><span class="label">Tuition Fee</span><span class="value">₹${booking.fee}</span></div>` : ""}
      ${booking.preferredTime ? `<div class="row"><span class="label">Preferred Time (IST)</span><span class="value">${booking.preferredTime}</span></div>` : ""}
      ${booking.preferredTime2 ? `<div class="row"><span class="label">Secondary Slot</span><span class="value">${booking.preferredTime2}</span></div>` : ""}
      ${booking.instructorPreference ? `<div class="row"><span class="label">Instructor Preference</span><span class="value">${booking.instructorPreference}</span></div>` : ""}
      ${booking.joiningDate ? `<div class="row"><span class="label">Joining Date</span><span class="value">${booking.joiningDate}</span></div>` : ""}
      ${booking.language ? `<div class="row"><span class="label">Language</span><span class="value">${booking.language}</span></div>` : ""}
    </div>

    ${booking.message ? `<div class="card"><div class="card-title">Message from Student</div><p style="margin:0;color:#171A32;font-size:14px;line-height:1.6">"${booking.message}"</p></div>` : ""}

    <div class="btn-wrap">
      <a href="${process.env.DASHBOARD_URL || "http://localhost:5173"}" class="btn">Open Admin Dashboard →</a>
    </div>
    <p style="text-align:center;color:#A3A8C3;font-size:12px;margin-top:8px">Go to Enquiries → Bookings in the studio dashboard to manage this request</p>
  </div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} yogaonlive Admin Notification System<br>
    This is an automated notification. Booking Ref: <strong>${booking.bookingRef}</strong></p>
  </div>
</div>
</body></html>`;
}

// ─── Send Functions ──────────────────────────────────────────────────────────
export async function sendUserConfirmationEmail(booking) {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(
      `[Email] ⚠️ SMTP credentials not configured in server/.env — skipping user confirmation email.\n` +
      `  • Would have sent confirmation to student: ${booking.email} (Ref: ${booking.bookingRef})\n` +
      `  • To enable real emails: set EMAIL_USER & EMAIL_PASS in server/.env`
    );
    return { skipped: true, reason: "SMTP credentials not configured in server/.env" };
  }

  const mailOptions = {
    from: `"yogaonlive Studio" <${process.env.EMAIL_USER.trim()}>`,
    to: booking.email,
    subject: `✅ Booking Confirmed — ${booking.bookingRef} | yogaonlive`,
    html: buildUserEmailHTML(booking),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] ✅ Confirmation sent to user (${booking.email}): ${info.messageId}`);
    return { success: true, messageId: info.messageId, recipient: booking.email };
  } catch (error) {
    console.error(`[Email] ❌ Failed to send user confirmation to ${booking.email}:`, error.message);
    return { error: error.message, recipient: booking.email };
  }
}

export async function sendAdminNotificationEmail(booking) {
  const transporter = createTransporter();
  const adminEmail =
    process.env.ADMIN_EMAIL &&
    process.env.ADMIN_EMAIL !== "admin-notify@gmail.com" &&
    !process.env.ADMIN_EMAIL.includes("example.com")
      ? process.env.ADMIN_EMAIL.trim()
      : process.env.EMAIL_USER?.trim();

  if (!transporter || !adminEmail || adminEmail === "your-gmail@gmail.com") {
    console.log(
      `[Email] ⚠️ Admin email or SMTP not configured in server/.env — skipping admin notification.\n` +
      `  • New booking from: ${booking.name} (${booking.email})\n` +
      `  • Age: ${booking.age || "N/A"} | Gender: ${booking.gender || "N/A"}\n` +
      `  • Class: ${booking.classType} | Ref: ${booking.bookingRef}\n` +
      `  • To receive admin emails: set EMAIL_USER, EMAIL_PASS, and ADMIN_EMAIL in server/.env`
    );
    return { skipped: true, reason: "SMTP credentials or admin email not set in server/.env" };
  }

  const mailOptions = {
    from: `"yogaonlive Bookings" <${process.env.EMAIL_USER.trim()}>`,
    to: adminEmail,
    subject: `🔔 New Booking: ${booking.name} (${booking.bookingRef}) — yogaonlive`,
    html: buildAdminEmailHTML(booking),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] ✅ Admin notification sent to ${adminEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId, recipient: adminEmail };
  } catch (error) {
    console.error(`[Email] ❌ Failed to send admin notification to ${adminEmail}:`, error.message);
    return { error: error.message, recipient: adminEmail };
  }
}

// ─── Test Helper ─────────────────────────────────────────────────────────────
export async function verifyEmailTransporter() {
  const transporter = createTransporter();
  const adminEmail =
    process.env.ADMIN_EMAIL &&
    process.env.ADMIN_EMAIL !== "admin-notify@gmail.com" &&
    !process.env.ADMIN_EMAIL.includes("example.com")
      ? process.env.ADMIN_EMAIL.trim()
      : process.env.EMAIL_USER?.trim();

  if (!transporter) {
    return {
      configured: false,
      message:
        "Gmail SMTP is not configured in server/.env. Please set EMAIL_USER (your Gmail) and EMAIL_PASS (Google 16-char App Password).",
      emailUser: process.env.EMAIL_USER || "Not set",
      adminEmail: adminEmail || "Not set",
    };
  }

  try {
    await transporter.verify();
    return {
      configured: true,
      emailUser: process.env.EMAIL_USER,
      adminEmail,
      message: "Gmail SMTP connection successfully verified and active!",
    };
  } catch (err) {
    return {
      configured: false,
      error: err.message,
      message: `SMTP connection failed: ${err.message}. If using Gmail, ensure you are using a 16-character App Password.`,
    };
  }
}

export async function testEmailTransporter(testRecipient) {
  const transporter = createTransporter();
  const adminEmail =
    process.env.ADMIN_EMAIL &&
    process.env.ADMIN_EMAIL !== "admin-notify@gmail.com" &&
    !process.env.ADMIN_EMAIL.includes("example.com")
      ? process.env.ADMIN_EMAIL.trim()
      : process.env.EMAIL_USER?.trim();

  if (!transporter) {
    return {
      configured: false,
      message:
        "Gmail SMTP is not configured in server/.env. Please set EMAIL_USER (your Gmail) and EMAIL_PASS (Google 16-char App Password).",
      emailUser: process.env.EMAIL_USER || "Not set",
      adminEmail: adminEmail || "Not set",
    };
  }

  try {
    await transporter.verify();
    const recipient = testRecipient || adminEmail;
    const testMail = {
      from: `"yogaonlive Studio" <${process.env.EMAIL_USER.trim()}>`,
      to: recipient,
      subject: "🧪 Test Email from yogaonlive Studio",
      html: `<h3>yogaonlive Email System is Working! 🎉</h3><p>This is a test email confirming that your Gmail SMTP configuration in <code>server/.env</code> is active and delivering emails to both user and admin.</p>`,
    };
    const info = await transporter.sendMail(testMail);
    return {
      configured: true,
      delivered: true,
      recipient,
      messageId: info.messageId,
      message: `Test email successfully delivered to ${recipient}!`,
    };
  } catch (err) {
    return {
      configured: false,
      delivered: false,
      error: err.message,
      message: `SMTP connection failed: ${err.message}. If using Gmail, make sure you use an App Password (not your normal Gmail password) and 2-Step Verification is enabled on your Google account.`,
    };
  }
}
