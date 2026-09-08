import nodemailer from "nodemailer";

// ─── Transporter Pool ────────────────────────────────────────────────────────
let transporterInstance = null;

function getTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (
    !user ||
    !pass ||
    user === "your-gmail@gmail.com" ||
    pass === "your-16-char-app-password" ||
    user.includes("example.com")
  ) {
    return null;
  }

  if (!transporterInstance) {
    transporterInstance = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: user.trim(),
        pass: pass.trim(),
      },
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
    });
  }

  return transporterInstance;
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
    body { margin:0; padding:0; background-color:#F6F7FB; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; -webkit-font-smoothing:antialiased; }
    .wrap { max-width:580px; margin:28px auto; background:#ffffff; border-radius:18px; border:1px solid #E3E6F2; overflow:hidden; }
    a.btn, .btn, .btn span { color:#ffffff !important; text-decoration:none !important; }
  </style>
`;

// ─── Plain Text Email Builders (Vital for High Deliverability / Anti-Spam) ────
export function buildUserEmailText(booking) {
  const firstName = (booking.name || "").trim().split(" ")[0] || "there";
  return `Hi ${firstName},

Thank you for choosing yogaonlive! Your booking request has been confirmed.

Booking Reference: ${booking.bookingRef}

Your Booking Details:
• Name: ${booking.name}
• Email: ${booking.email}
${booking.phone ? `• Phone / WhatsApp: ${booking.phone}\n` : ""}${booking.classType ? `• Class Preference: ${classTypeLabel(booking.classType)}\n` : ""}${booking.groupCohort ? `• Selected Cohort: ${booking.groupCohort}\n` : ""}${booking.preferredTime ? `• Preferred Time (IST): ${booking.preferredTime}\n` : ""}${booking.preferredTime2 ? `• Secondary Slot: ${booking.preferredTime2}\n` : ""}${booking.joiningDate ? `• Trial / Joining Date: ${booking.joiningDate}\n` : ""}${booking.language ? `• Language: ${booking.language}\n` : ""}
What Happens Next:
1. Review (within 24 hours) — Our team reviews your preferences and pairs you with the best instructor.
2. Personal outreach — We will reach out via WhatsApp or email to finalize your trial session.
3. Trial session — Attend your live complimentary online yoga class with real-time feedback.
4. Enroll — Begin your consistent yoga practice with our global community!

If you have any questions, feel free to reply directly to this email.

Namaste,
The yogaonlive Team
https://yogaonlive.com
`;
}

export function buildAdminEmailText(booking) {
  const submittedAt = new Date(booking.createdAt || Date.now()).toLocaleString(
    "en-IN",
    { timeZone: "Asia/Kolkata", dateStyle: "full", timeStyle: "short" },
  );

  return `New Booking Received!

Booking Reference: ${booking.bookingRef}
Submitted: ${submittedAt}
Source: ${booking.source || "Direct"}
${booking.referralUrl ? `Referral: ${booking.referralUrl}\n` : ""}
Student Information:
• Name: ${booking.name}
• Email: ${booking.email}
• Phone: ${booking.phone || "N/A"}
• Age / Gender: ${booking.age || "N/A"} / ${booking.gender || "N/A"}
• Country: ${booking.country || "N/A"} (${booking.timezone || "N/A"})

Class Preferences:
• Class Type: ${classTypeLabel(booking.classType)}
• Cohort: ${booking.groupCohort || "N/A"}
• Fee: ₹${booking.fee || 0}
• Preferred Time: ${booking.preferredTime || "N/A"}
• Secondary Slot: ${booking.preferredTime2 || "N/A"}
• Joining Date: ${booking.joiningDate || "N/A"}
• Language: ${booking.language || "N/A"}
${booking.message ? `• Message: "${booking.message}"\n` : ""}
Open Admin Dashboard:
${process.env.DASHBOARD_URL || "http://localhost:5174"}
`;
}

// ─── User Confirmation Email HTML ────────────────────────────────────────────
export function buildUserEmailHTML(booking) {
  const firstName = (booking.name || "").trim().split(" ")[0] || "there";

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">${BASE_STYLES}</head>
<body style="margin:0;padding:20px 10px;background-color:#F6F7FB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<div style="max-width:580px;margin:0 auto;background-color:#ffffff;border-radius:18px;border:1px solid #E3E6F2;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,0.04);">
  
  <!-- Header Banner -->
  <div style="background:linear-gradient(135deg,#4C5FD5 0%,#6B7FEB 100%);padding:30px 32px;color:#ffffff;">
    <div style="margin-bottom:14px;">
      <table border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td style="vertical-align:middle;padding-right:8px;font-size:24px;line-height:1;">☀️</td>
          <td style="vertical-align:middle;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">yogaonlive</td>
        </tr>
      </table>
    </div>
    <h1 style="font-size:24px;font-weight:700;color:#ffffff;margin:0 0 6px;letter-spacing:-0.01em;">Your booking is confirmed 🎉</h1>
    <p style="font-size:14px;color:rgba(255,255,255,0.9);margin:0;line-height:1.5;">We've received your request and our team will reach out to you within 24 hours.</p>
  </div>

  <!-- Body -->
  <div style="padding:28px 32px;">
    <p style="font-size:15px;color:#333C4E;line-height:1.6;margin:0 0 14px;">Hi <strong>${firstName}</strong>,</p>
    <p style="font-size:14.5px;color:#4B5264;line-height:1.6;margin:0 0 16px;">
      Thank you for choosing yogaonlive. We're excited to begin this journey with you! Your booking request has been received and assigned a reference number:
    </p>

    <!-- Ref Badge -->
    <div style="text-align:center;margin:12px 0 22px;">
      <span style="display:inline-block;background-color:#EEF0FA;color:#4C5FD5;font-family:Consolas,Monaco,monospace;font-size:15px;font-weight:700;padding:8px 18px;border-radius:8px;letter-spacing:0.06em;border:1px solid #D8DDF5;">
        ${booking.bookingRef}
      </span>
    </div>

    <!-- Booking Details Card -->
    <div style="background-color:#F8F9FD;border-radius:14px;border:1px solid #E3E6F2;padding:18px 20px;margin:18px 0 24px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#858BB0;margin:0 0 12px;">Your Booking Details</div>
      
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size:13.5px;border-collapse:collapse;">
        <tr style="border-bottom:1px solid #EAECEF;">
          <td style="padding:9px 0;color:#6B7089;font-weight:500;">Name</td>
          <td style="padding:9px 0;color:#171A32;font-weight:600;text-align:right;">${booking.name}</td>
        </tr>
        <tr style="border-bottom:1px solid #EAECEF;">
          <td style="padding:9px 0;color:#6B7089;font-weight:500;">Email</td>
          <td style="padding:9px 0;color:#171A32;font-weight:600;text-align:right;">${booking.email}</td>
        </tr>
        ${
          booking.phone
            ? `
        <tr style="border-bottom:1px solid #EAECEF;">
          <td style="padding:9px 0;color:#6B7089;font-weight:500;">WhatsApp / Phone</td>
          <td style="padding:9px 0;color:#171A32;font-weight:600;text-align:right;">${booking.phone}</td>
        </tr>`
            : ""
        }
        ${
          booking.country
            ? `
        <tr style="border-bottom:1px solid #EAECEF;">
          <td style="padding:9px 0;color:#6B7089;font-weight:500;">Country</td>
          <td style="padding:9px 0;color:#171A32;font-weight:600;text-align:right;">${booking.country}</td>
        </tr>`
            : ""
        }
        <tr style="border-bottom:1px solid #EAECEF;">
          <td style="padding:9px 0;color:#6B7089;font-weight:500;">Class Preference</td>
          <td style="padding:9px 0;color:#171A32;font-weight:600;text-align:right;">${classTypeLabel(booking.classType)}</td>
        </tr>
        ${
          booking.groupCohort
            ? `
        <tr style="border-bottom:1px solid #EAECEF;">
          <td style="padding:9px 0;color:#6B7089;font-weight:500;">Cohort</td>
          <td style="padding:9px 0;color:#171A32;font-weight:600;text-align:right;">${booking.groupCohort}</td>
        </tr>`
            : ""
        }
        ${
          booking.preferredTime
            ? `
        <tr style="border-bottom:1px solid #EAECEF;">
          <td style="padding:9px 0;color:#6B7089;font-weight:500;">Preferred Slot (IST)</td>
          <td style="padding:9px 0;color:#171A32;font-weight:600;text-align:right;">${booking.preferredTime}</td>
        </tr>`
            : ""
        }
        ${
          booking.joiningDate
            ? `
        <tr style="border-bottom:1px solid #EAECEF;">
          <td style="padding:9px 0;color:#6B7089;font-weight:500;">Trial / Joining Date</td>
          <td style="padding:9px 0;color:#171A32;font-weight:600;text-align:right;">${booking.joiningDate}</td>
        </tr>`
            : ""
        }
        ${
          booking.language
            ? `
        <tr>
          <td style="padding:9px 0;color:#6B7089;font-weight:500;">Language</td>
          <td style="padding:9px 0;color:#171A32;font-weight:600;text-align:right;">${booking.language}</td>
        </tr>`
            : ""
        }
      </table>
    </div>

    <!-- Next Steps Card -->
    <div style="background-color:#F8F9FD;border-radius:14px;border:1px solid #E3E6F2;padding:18px 20px;margin:0 0 24px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#858BB0;margin:0 0 12px;">What Happens Next?</div>
      
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size:13px;">
        <tr>
          <td style="width:26px;vertical-align:top;padding-bottom:12px;">
            <div style="width:22px;height:22px;border-radius:50%;background-color:#4C5FD5;color:#ffffff;font-size:11px;font-weight:700;text-align:center;line-height:22px;">1</div>
          </td>
          <td style="padding-left:10px;padding-bottom:12px;color:#4B5264;line-height:1.5;">
            <strong style="color:#171A32;">Review (within 24h)</strong> — Our team reviews your preferences and pairs you with the best certified instructor.
          </td>
        </tr>
        <tr>
          <td style="width:26px;vertical-align:top;padding-bottom:12px;">
            <div style="width:22px;height:22px;border-radius:50%;background-color:#4C5FD5;color:#ffffff;font-size:11px;font-weight:700;text-align:center;line-height:22px;">2</div>
          </td>
          <td style="padding-left:10px;padding-bottom:12px;color:#4B5264;line-height:1.5;">
            <strong style="color:#171A32;">Personal outreach</strong> — We'll contact you via WhatsApp or email to confirm your trial slot.
          </td>
        </tr>
        <tr>
          <td style="width:26px;vertical-align:top;padding-bottom:12px;">
            <div style="width:22px;height:22px;border-radius:50%;background-color:#4C5FD5;color:#ffffff;font-size:11px;font-weight:700;text-align:center;line-height:22px;">3</div>
          </td>
          <td style="padding-left:10px;padding-bottom:12px;color:#4B5264;line-height:1.5;">
            <strong style="color:#171A32;">Trial session</strong> — Experience a complimentary live trial class with real-time posture guidance.
          </td>
        </tr>
        <tr>
          <td style="width:26px;vertical-align:top;">
            <div style="width:22px;height:22px;border-radius:50%;background-color:#4C5FD5;color:#ffffff;font-size:11px;font-weight:700;text-align:center;line-height:22px;">4</div>
          </td>
          <td style="padding-left:10px;color:#4B5264;line-height:1.5;">
            <strong style="color:#171A32;">Enroll</strong> — Enjoy practicing consistently with our live online yoga family!
          </td>
        </tr>
      </table>
    </div>

    <p style="font-size:14px;color:#4B5264;line-height:1.6;margin:0 0 10px;">
      If you have any immediate questions, simply reply directly to this email and our team will get back to you promptly.
    </p>

    <p style="font-size:14px;color:#171A32;line-height:1.6;margin:0 0 18px;">
      Namaste 🙏<br><strong>The yogaonlive Team</strong>
    </p>

    <!-- Inbox Delivery Notice -->
    <div style="border-top:1px dashed #D8DDF5;padding-top:14px;text-align:center;">
      <p style="font-size:12px;color:#858BB0;margin:0;line-height:1.5;">
        💡 <em>To guarantee you receive class invites, please add <strong>${process.env.EMAIL_USER?.trim() || "support@yogaonlive.com"}</strong> to your contacts or mark this email as "Not Spam".</em>
      </p>
    </div>
  </div>

  <!-- Footer -->
  <div style="background-color:#F8F9FD;padding:18px 32px;border-top:1px solid #E3E6F2;text-align:center;">
    <p style="font-size:11.5px;color:#9EA4C1;margin:0;line-height:1.5;">
      © ${new Date().getFullYear()} yogaonlive · Online Yoga Studio<br>
      Booking Reference: <strong>${booking.bookingRef}</strong>
    </p>
  </div>
</div>
</body></html>`;
}

// ─── Admin Notification Email HTML ───────────────────────────────────────────
export function buildAdminEmailHTML(booking) {
  const submittedAt = new Date(booking.createdAt || Date.now()).toLocaleString(
    "en-IN",
    { timeZone: "Asia/Kolkata", dateStyle: "full", timeStyle: "short" },
  );

  const baseUrl = process.env.DASHBOARD_URL || "http://localhost:5173";
  const dashboardUrl = `${baseUrl.replace(/\/$/, "")}/?tab=enquiries`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">${BASE_STYLES}</head>
<body style="margin:0;padding:20px 10px;background-color:#F6F7FB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<div style="max-width:580px;margin:0 auto;background-color:#ffffff;border-radius:18px;border:1px solid #E3E6F2;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,0.04);">
  
  <!-- Header Banner -->
  <div style="background:linear-gradient(135deg,#1E9E63 0%,#27b77a 100%);padding:30px 32px;color:#ffffff;">
    <div style="margin-bottom:14px;">
      <table border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td style="vertical-align:middle;padding-right:8px;font-size:24px;line-height:1;">🔔</td>
          <td style="vertical-align:middle;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">yogaonlive Studio Admin</td>
        </tr>
      </table>
    </div>
    <h1 style="font-size:24px;font-weight:700;color:#ffffff;margin:0 0 6px;letter-spacing:-0.01em;">New Booking Received 🔔</h1>
    <p style="font-size:14px;color:rgba(255,255,255,0.92);margin:0;line-height:1.5;">A new student booking request has been submitted via <strong>${booking.source || "yogaonlive"}</strong>.</p>
  </div>

  <!-- Body -->
  <div style="padding:28px 32px;">
    <p style="font-size:14.5px;color:#4B5264;line-height:1.6;margin:0 0 16px;">
      A new student booking has come in. Here are the full details:
    </p>

    <!-- Reference & Meta Card -->
    <div style="background-color:#F8F9FD;border-radius:14px;border:1px solid #E3E6F2;padding:16px 20px;margin:0 0 18px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#858BB0;margin:0 0 10px;">Booking Reference &amp; Meta</div>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size:13px;border-collapse:collapse;">
        <tr style="border-bottom:1px solid #EAECEF;">
          <td style="padding:8px 0;color:#6B7089;font-weight:500;">Booking Ref</td>
          <td style="padding:8px 0;color:#4C5FD5;font-weight:700;font-family:Consolas,Monaco,monospace;text-align:right;">${booking.bookingRef}</td>
        </tr>
        <tr style="border-bottom:1px solid #EAECEF;">
          <td style="padding:8px 0;color:#6B7089;font-weight:500;">Submitted</td>
          <td style="padding:8px 0;color:#171A32;font-weight:600;text-align:right;">${submittedAt}</td>
        </tr>
        <tr style="border-bottom:1px solid #EAECEF;">
          <td style="padding:8px 0;color:#6B7089;font-weight:500;">Source</td>
          <td style="padding:8px 0;color:#171A32;font-weight:600;text-align:right;">${booking.source || "Direct"}</td>
        </tr>
        ${
          booking.referralUrl
            ? `
        <tr>
          <td style="padding:8px 0;color:#6B7089;font-weight:500;">Referral URL</td>
          <td style="padding:8px 0;color:#171A32;font-weight:500;font-size:11px;word-break:break-all;text-align:right;">${booking.referralUrl}</td>
        </tr>`
            : ""
        }
      </table>
    </div>

    <!-- Student Information Card -->
    <div style="background-color:#F8F9FD;border-radius:14px;border:1px solid #E3E6F2;padding:16px 20px;margin:0 0 18px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#858BB0;margin:0 0 10px;">Student Information</div>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size:13px;border-collapse:collapse;">
        <tr style="border-bottom:1px solid #EAECEF;">
          <td style="padding:8px 0;color:#6B7089;font-weight:500;">Full Name</td>
          <td style="padding:8px 0;color:#171A32;font-weight:700;text-align:right;">${booking.name}</td>
        </tr>
        <tr style="border-bottom:1px solid #EAECEF;">
          <td style="padding:8px 0;color:#6B7089;font-weight:500;">Email</td>
          <td style="padding:8px 0;color:#4C5FD5;font-weight:600;text-align:right;">
            <a href="mailto:${booking.email}" style="color:#4C5FD5;text-decoration:none;">${booking.email}</a>
          </td>
        </tr>
        ${
          booking.phone
            ? `
        <tr style="border-bottom:1px solid #EAECEF;">
          <td style="padding:8px 0;color:#6B7089;font-weight:500;">WhatsApp / Phone</td>
          <td style="padding:8px 0;color:#171A32;font-weight:600;text-align:right;">${booking.phone}</td>
        </tr>`
            : ""
        }
        ${
          booking.age
            ? `
        <tr style="border-bottom:1px solid #EAECEF;">
          <td style="padding:8px 0;color:#6B7089;font-weight:500;">Age</td>
          <td style="padding:8px 0;color:#171A32;font-weight:600;text-align:right;">${booking.age} years</td>
        </tr>`
            : ""
        }
        ${
          booking.gender
            ? `
        <tr style="border-bottom:1px solid #EAECEF;">
          <td style="padding:8px 0;color:#6B7089;font-weight:500;">Gender</td>
          <td style="padding:8px 0;color:#171A32;font-weight:600;text-align:right;">${booking.gender}</td>
        </tr>`
            : ""
        }
        ${
          booking.country
            ? `
        <tr style="border-bottom:1px solid #EAECEF;">
          <td style="padding:8px 0;color:#6B7089;font-weight:500;">Country</td>
          <td style="padding:8px 0;color:#171A32;font-weight:600;text-align:right;">${booking.country}</td>
        </tr>`
            : ""
        }
        ${
          booking.timezone
            ? `
        <tr>
          <td style="padding:8px 0;color:#6B7089;font-weight:500;">Timezone</td>
          <td style="padding:8px 0;color:#171A32;font-weight:600;text-align:right;">${booking.timezone}</td>
        </tr>`
            : ""
        }
      </table>
    </div>

    <!-- Class Preferences Card -->
    <div style="background-color:#F8F9FD;border-radius:14px;border:1px solid #E3E6F2;padding:16px 20px;margin:0 0 18px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#858BB0;margin:0 0 10px;">Class Preferences</div>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size:13px;border-collapse:collapse;">
        <tr style="border-bottom:1px solid #EAECEF;">
          <td style="padding:8px 0;color:#6B7089;font-weight:500;">Class Type</td>
          <td style="padding:8px 0;color:#171A32;font-weight:600;text-align:right;">${classTypeLabel(booking.classType)}</td>
        </tr>
        ${
          booking.groupCohort
            ? `
        <tr style="border-bottom:1px solid #EAECEF;">
          <td style="padding:8px 0;color:#6B7089;font-weight:500;">Cohort</td>
          <td style="padding:8px 0;color:#171A32;font-weight:600;text-align:right;">${booking.groupCohort}</td>
        </tr>`
            : ""
        }
        ${
          booking.fee
            ? `
        <tr style="border-bottom:1px solid #EAECEF;">
          <td style="padding:8px 0;color:#6B7089;font-weight:500;">Tuition Fee</td>
          <td style="padding:8px 0;color:#1E9E63;font-weight:700;text-align:right;">₹${booking.fee}</td>
        </tr>`
            : ""
        }
        ${
          booking.preferredTime
            ? `
        <tr style="border-bottom:1px solid #EAECEF;">
          <td style="padding:8px 0;color:#6B7089;font-weight:500;">Preferred Slot (IST)</td>
          <td style="padding:8px 0;color:#171A32;font-weight:600;text-align:right;">${booking.preferredTime}</td>
        </tr>`
            : ""
        }
        ${
          booking.preferredTime2
            ? `
        <tr style="border-bottom:1px solid #EAECEF;">
          <td style="padding:8px 0;color:#6B7089;font-weight:500;">Secondary Slot</td>
          <td style="padding:8px 0;color:#171A32;font-weight:600;text-align:right;">${booking.preferredTime2}</td>
        </tr>`
            : ""
        }
        ${
          booking.instructorPreference
            ? `
        <tr style="border-bottom:1px solid #EAECEF;">
          <td style="padding:8px 0;color:#6B7089;font-weight:500;">Instructor Preference</td>
          <td style="padding:8px 0;color:#171A32;font-weight:600;text-align:right;">${booking.instructorPreference}</td>
        </tr>`
            : ""
        }
        ${
          booking.joiningDate
            ? `
        <tr style="border-bottom:1px solid #EAECEF;">
          <td style="padding:8px 0;color:#6B7089;font-weight:500;">Joining Date</td>
          <td style="padding:8px 0;color:#171A32;font-weight:600;text-align:right;">${booking.joiningDate}</td>
        </tr>`
            : ""
        }
        ${
          booking.language
            ? `
        <tr>
          <td style="padding:8px 0;color:#6B7089;font-weight:500;">Language</td>
          <td style="padding:8px 0;color:#171A32;font-weight:600;text-align:right;">${booking.language}</td>
        </tr>`
            : ""
        }
      </table>
    </div>

    ${
      booking.message
        ? `
    <div style="background-color:#F8F9FD;border-radius:14px;border:1px solid #E3E6F2;padding:16px 20px;margin:0 0 20px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#858BB0;margin:0 0 8px;">Message from Student</div>
      <p style="margin:0;color:#171A32;font-size:13.5px;line-height:1.6;font-style:italic;">"${booking.message}"</p>
    </div>`
        : ""
    }

    <!-- ═══ High-Contrast Bulletproof Admin Button ═══ -->
    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:26px auto 10px auto;">
      <tr>
        <td align="center" style="border-radius:12px;background-color:#4C5FD5;">
          <a href="${dashboardUrl}" target="_blank" style="display:inline-block;padding:14px 34px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;color:#FFFFFF !important;text-decoration:none !important;border-radius:12px;background-color:#4C5FD5;border:1px solid #4C5FD5;letter-spacing:-0.01em;">
            <span style="color:#FFFFFF !important;text-decoration:none !important;font-weight:700;font-size:15px;">Open Admin Dashboard &rarr;</span>
          </a>
        </td>
      </tr>
    </table>

    <p style="text-align:center;color:#858BB0;font-size:12px;margin:8px 0 0;">
      Go to Enquiries &rarr; Bookings in the studio dashboard to manage this request
    </p>
  </div>

  <!-- Footer -->
  <div style="background-color:#F8F9FD;padding:18px 32px;border-top:1px solid #E3E6F2;text-align:center;">
    <p style="font-size:11.5px;color:#9EA4C1;margin:0;line-height:1.5;">
      © ${new Date().getFullYear()} yogaonlive Admin Notification System<br>
      Automated Studio Notification · Ref: <strong>${booking.bookingRef}</strong>
    </p>
  </div>
</div>
</body></html>`;
}

// ─── Send Functions ──────────────────────────────────────────────────────────
export async function sendUserConfirmationEmail(booking) {
  const transporter = getTransporter();
  const adminEmail =
    process.env.ADMIN_EMAIL &&
    process.env.ADMIN_EMAIL !== "admin-notify@gmail.com" &&
    !process.env.ADMIN_EMAIL.includes("example.com")
      ? process.env.ADMIN_EMAIL.trim()
      : process.env.EMAIL_USER?.trim();

  if (!transporter) {
    console.log(
      `[Email] ⚠️ SMTP credentials not configured in server/.env — skipping user confirmation email.\n` +
        `  • Would have sent confirmation to student: ${booking.email} (Ref: ${booking.bookingRef})\n` +
        `  • To enable real emails: set EMAIL_USER & EMAIL_PASS in server/.env`,
    );
    return {
      skipped: true,
      reason: "SMTP credentials not configured in server/.env",
    };
  }

  const senderUser = process.env.EMAIL_USER.trim();
  const mailOptions = {
    from: `"yogaonlive Studio" <${senderUser}>`,
    to: booking.email,
    replyTo: adminEmail || senderUser,
    subject: `Booking Confirmed: ${booking.name} your ,  ${booking.bookingRef} — yogaonlive Studio`,
    text: buildUserEmailText(booking),
    html: buildUserEmailHTML(booking),
    headers: {
      "X-Entity-Ref-ID": booking.bookingRef,
    },
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `[Email] ✅ Confirmation successfully delivered to student (${booking.email}): ${info.messageId}`,
    );
    return {
      success: true,
      messageId: info.messageId,
      recipient: booking.email,
    };
  } catch (error) {
    console.error(
      `[Email] ❌ Failed to send user confirmation to ${booking.email}:`,
      error.message,
    );
    return { error: error.message, recipient: booking.email };
  }
}

export async function sendAdminNotificationEmail(booking) {
  const transporter = getTransporter();
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
        `  • Class: ${booking.classType} | Ref: ${booking.bookingRef}\n` +
        `  • To receive admin emails: set EMAIL_USER, EMAIL_PASS, and ADMIN_EMAIL in server/.env`,
    );
    return {
      skipped: true,
      reason: "SMTP credentials or admin email not set in server/.env",
    };
  }

  const senderUser = process.env.EMAIL_USER.trim();
  const mailOptions = {
    from: `"yogaonlive Bookings" <${senderUser}>`,
    to: adminEmail,
    replyTo: booking.email,
    subject: `🔔 New Booking: ${booking.name} (${booking.bookingRef}) — yogaonlive`,
    text: buildAdminEmailText(booking),
    html: buildAdminEmailHTML(booking),
    headers: {
      "X-Entity-Ref-ID": booking.bookingRef,
    },
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `[Email] ✅ Admin notification sent to ${adminEmail}: ${info.messageId}`,
    );
    return { success: true, messageId: info.messageId, recipient: adminEmail };
  } catch (error) {
    console.error(
      `[Email] ❌ Failed to send admin notification to ${adminEmail}:`,
      error.message,
    );
    return { error: error.message, recipient: adminEmail };
  }
}

// ─── Test Helpers ────────────────────────────────────────────────────────────
export async function verifyEmailTransporter() {
  const transporter = getTransporter();
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
  const transporter = getTransporter();
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
      subject: "Test Email from yogaonlive Studio",
      text: "yogaonlive Email System is Working!\nThis is a test email confirming that your Gmail SMTP configuration in server/.env is active and delivering emails to both user and admin.",
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
