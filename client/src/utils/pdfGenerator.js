import { formatDateHuman, addMonthsClamped, getCurrentDueDate } from "./dateUtils";

/**
 * Downloads a high-definition, professional vector PDF receipt for a student tuition settlement.
 */
export async function generateReceiptPDF(student, paymentSettings) {
  if (!student) return;
  const { default: jsPDF } = await import("jspdf");

  const due = getCurrentDueDate(student);
  const cycleStart = addMonthsClamped(due, -1);
  const receiptNumber = `REC-${new Date().getFullYear()}-${String(student.id).padStart(4, "0")}`;
  const issueDateStr = formatDateHuman(new Date());
  const cycleStartStr = formatDateHuman(cycleStart);
  const cycleEndStr = formatDateHuman(due);
  const amountStr = `INR ${Number(student.fee).toLocaleString("en-IN")}.00`;

  // Create A4 document in Portrait: 210mm x 297mm
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // Header background subtle banner
  doc.setFillColor(248, 247, 244);
  doc.rect(margin, 16, contentWidth, 34, "F");

  // Hairline border around header
  doc.setDrawColor(228, 225, 219);
  doc.setLineWidth(0.3);
  doc.rect(margin, 16, contentWidth, 34, "S");

  // Logo Icon Badge
  doc.setFillColor(18, 20, 19);
  doc.roundedRect(margin + 5, 22, 10, 10, 1.5, 1.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("D", margin + 8.5, 28.5);

  // Brand Titles
  doc.setTextColor(18, 20, 19);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("Devbhoomi Infotech", margin + 18, 27);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(107, 112, 110);
  doc.text("Studio Practice & Client Learning Operations", margin + 18, 33);
  doc.text("GST / Business Identification: 07AAACD1234F1Z8", margin + 18, 38);

  // Receipt Number & Verified Stamp (Top Right)
  doc.setFillColor(234, 245, 238);
  doc.roundedRect(pageWidth - margin - 42, 21, 38, 7, 1, 1, "F");
  doc.setDrawColor(198, 230, 211);
  doc.roundedRect(pageWidth - margin - 42, 21, 38, 7, 1, 1, "S");
  doc.setTextColor(29, 115, 68);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("SETTLED & VERIFIED", pageWidth - margin - 23, 25.5, { align: "center" });

  doc.setTextColor(18, 20, 19);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(receiptNumber, pageWidth - margin - 4, 34, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(107, 112, 110);
  doc.text(`Issued: ${issueDateStr}`, pageWidth - margin - 4, 39, { align: "right" });

  // Section: Student Coordinates
  let y = 60;
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, y, contentWidth, 30, "F");
  doc.setDrawColor(228, 225, 219);
  doc.rect(margin, y, contentWidth, 30, "S");

  // 3-Column Info
  const colW = contentWidth / 3;

  // Col 1: Student
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(107, 112, 110);
  doc.text("STUDENT COORDINATES", margin + 6, y + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(18, 20, 19);
  doc.text(student.name, margin + 6, y + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(107, 112, 110);
  doc.text(`${student.country} · ${student.phone || "No phone"}`, margin + 6, y + 20);
  if (student.email) {
    doc.text(student.email, margin + 6, y + 25);
  }

  // Col 2: Cohort & Instructor
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(107, 112, 110);
  doc.text("COHORT ASSIGNMENT", margin + colW + 6, y + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(18, 20, 19);
  const cohortLabel = student.classType === "group"
    ? `Group Cohort (${student.groupName || "Standard"})`
    : "Private (1-on-1 Practice)";
  doc.text(cohortLabel, margin + colW + 6, y + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(107, 112, 110);
  doc.text(`Instructor: ${student.instructor || "Assigned Teacher"}`, margin + colW + 6, y + 20);
  doc.text(`Session Time: ${student.classTimeIST} IST (${student.duration || "1 Hr"})`, margin + colW + 6, y + 25);

  // Col 3: Billing Cycle
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(107, 112, 110);
  doc.text("TUITION CYCLE", margin + colW * 2 + 6, y + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(18, 20, 19);
  doc.text("30-Day Practice Period", margin + colW * 2 + 6, y + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(107, 112, 110);
  doc.text(`${cycleStartStr} to`, margin + colW * 2 + 6, y + 20);
  doc.text(cycleEndStr, margin + colW * 2 + 6, y + 25);

  // Table of Items
  y = 100;

  // Table Header
  doc.setFillColor(248, 247, 244);
  doc.rect(margin, y, contentWidth, 8, "F");
  doc.setDrawColor(228, 225, 219);
  doc.rect(margin, y, contentWidth, 8, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(107, 112, 110);
  doc.text("DESCRIPTION", margin + 6, y + 5.5);
  doc.text("CYCLE FREQUENCY", margin + 115, y + 5.5);
  doc.text("AMOUNT (INR)", pageWidth - margin - 6, y + 5.5, { align: "right" });

  // Table Body Row
  y += 8;
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, y, contentWidth, 22, "F");
  doc.setDrawColor(228, 225, 219);
  doc.rect(margin, y, contentWidth, 22, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(18, 20, 19);
  doc.text("Personalized Yoga Practice & Asana Instruction", margin + 6, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(107, 112, 110);
  doc.text(
    "Full tuition coverage for posture alignment, breathing pranayama, attendance logging & teacher desk access.",
    margin + 6,
    y + 13
  );
  doc.text(`Covered range: ${cycleStartStr} — ${cycleEndStr}`, margin + 6, y + 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(18, 20, 19);
  doc.text("30 Days Clamped", margin + 115, y + 10);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(amountStr, pageWidth - margin - 6, y + 10, { align: "right" });

  // Table Footer / Total
  y += 22;
  doc.setFillColor(248, 247, 244);
  doc.rect(margin, y, contentWidth, 12, "F");
  doc.setDrawColor(228, 225, 219);
  doc.rect(margin, y, contentWidth, 12, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(18, 20, 19);
  doc.text("TOTAL TUITION SETTLED", margin + 6, y + 7.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(amountStr, pageWidth - margin - 6, y + 8, { align: "right" });

  // Settlement Details & Banking Coordinates
  y += 20;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, y, contentWidth, 32, 1.5, 1.5, "F");
  doc.setDrawColor(228, 225, 219);
  doc.roundedRect(margin, y, contentWidth, 32, 1.5, 1.5, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(107, 112, 110);
  doc.text("PAYMENT COORDINATES & SETTLEMENT LOG", margin + 6, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(18, 20, 19);
  doc.text(`Payee Entity: ${paymentSettings?.payeeName || "Devbhoomi Infotech"}`, margin + 6, y + 14);
  doc.text(`Primary UPI ID: ${paymentSettings?.upiId || "devbhoomi@upi"}`, margin + 6, y + 20);
  doc.text(
    `Bank Name: ${paymentSettings?.bankName || "HDFC Bank Ltd"} (Account: ${paymentSettings?.accountNumber || "50200084729112"})`,
    margin + 6,
    y + 26
  );

  // Digital Signature Stamp
  doc.setDrawColor(29, 115, 68);
  doc.setLineWidth(0.4);
  doc.roundedRect(pageWidth - margin - 52, y + 5, 46, 22, 1, 1, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(29, 115, 68);
  doc.text("DEVBHOOMI INFOTECH", pageWidth - margin - 29, y + 11, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(107, 112, 110);
  doc.text("STUDIO SYSTEM VERIFIED", pageWidth - margin - 29, y + 16, { align: "center" });
  doc.text("DIGITAL ACCOUNTING STAMP", pageWidth - margin - 29, y + 21, { align: "center" });

  // Legal & Terms Footer
  y = 265;
  doc.setDrawColor(228, 225, 219);
  doc.line(margin, y, pageWidth - margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(142, 138, 130);
  doc.text(
    "This voucher constitutes a verified electronic tuition receipt issued under Devbhoomi Infotech Studio Governance.",
    margin,
    y + 5
  );
  doc.text(
    "Classes cover 30-day practice cycles and are non-refundable upon commencement. Inquiries: contact your yoga teacher.",
    margin,
    y + 9
  );
  doc.text(
    `Document UID: ${receiptNumber} · Generated on ${issueDateStr}`,
    margin,
    y + 13
  );

  // Trigger browser direct download
  const safeName = student.name.replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `Devbhoomi_Receipt_${safeName}_${receiptNumber}.pdf`;
  doc.save(filename);
}

/**
 * Reliable standalone printable receipt window that never gets clipped by modals
 */
export function printReceiptWindow(student, paymentSettings) {
  if (!student) return;

  const due = getCurrentDueDate(student);
  const cycleStart = addMonthsClamped(due, -1);
  const receiptNumber = `REC-${new Date().getFullYear()}-${String(student.id).padStart(4, "0")}`;
  const todayStr = formatDateHuman(new Date());
  const cycleStartStr = formatDateHuman(cycleStart);
  const cycleEndStr = formatDateHuman(due);
  const amountStr = `₹${Number(student.fee).toLocaleString("en-IN")}.00`;

  const printWindow = window.open("", "_blank", "width=850,height=900");
  if (!printWindow) {
    alert("Please allow popups to print the receipt.");
    return;
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${receiptNumber} — Devbhoomi Infotech Receipt</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fff; color: #121413; padding: 32px; font-size: 13px; line-height: 1.5; }
    .receipt-box { max-width: 740px; margin: 0 auto; border: 1px solid #E6E5E0; border-radius: 6px; padding: 32px; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #E6E5E0; padding-bottom: 20px; margin-bottom: 24px; }
    .brand { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .logo-badge { width: 26px; height: 26px; background: #121413; color: #fff; border-radius: 4px; font-weight: bold; font-size: 13px; display: flex; align-items: center; justify-content: center; }
    .brand-name { font-size: 18px; font-weight: 800; color: #121413; letter-spacing: -0.02em; }
    .subhead { font-family: monospace; font-size: 11px; color: #6B706E; }
    .receipt-id-box { text-align: right; }
    .status-badge { display: inline-block; padding: 3px 8px; background: #EAF5EE; color: #1D7344; border: 1px solid #C6E6D3; border-radius: 4px; font-family: monospace; font-size: 10.5px; font-weight: bold; text-transform: uppercase; margin-bottom: 6px; }
    .rec-num { font-family: monospace; font-size: 13px; font-weight: bold; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; border-bottom: 1px solid #E6E5E0; padding-bottom: 20px; margin-bottom: 24px; }
    .label { font-family: monospace; font-size: 10px; text-transform: uppercase; color: #6B706E; margin-bottom: 4px; display: block; }
    .val-bold { font-size: 14px; font-weight: bold; color: #121413; }
    .val-sub { font-size: 12px; color: #6B706E; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { font-family: monospace; font-size: 10.5px; text-transform: uppercase; color: #6B706E; border-bottom: 1px solid #E6E5E0; padding: 10px 8px; text-align: left; }
    td { padding: 14px 8px; border-bottom: 1px solid #E6E5E0; font-size: 13px; }
    .desc-title { font-weight: bold; }
    .desc-sub { font-size: 11.5px; color: #6B706E; margin-top: 2px; }
    .total-row td { font-weight: bold; font-size: 14px; border-top: 2px solid #121413; }
    .footer-box { background: #FBFBFA; border: 1px solid #E6E5E0; border-radius: 4px; padding: 14px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; font-size: 11.5px; }
    .stamp-box { border: 1px solid #1D7344; border-radius: 4px; padding: 8px 14px; text-align: center; color: #1D7344; font-family: monospace; font-weight: bold; font-size: 10.5px; }
    .terms { font-size: 10px; color: #8E8A82; border-top: 1px solid #E6E5E0; padding-top: 14px; line-height: 1.4; }
    @media print {
      body { padding: 0; }
      .receipt-box { border: none; padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="receipt-box">
    <div class="header">
      <div>
        <div class="brand">
          <div class="logo-badge">D</div>
          <span class="brand-name">Devbhoomi Infotech</span>
        </div>
        <div class="subhead">Studio Practice & Client Learning Operations</div>
        <div class="subhead" style="font-size: 10px; margin-top: 2px;">GST: 07AAACD1234F1Z8</div>
      </div>
      <div class="receipt-id-box">
        <div class="status-badge">Settled & Verified</div>
        <div class="rec-num">${receiptNumber}</div>
        <div class="subhead">Issued: ${todayStr}</div>
      </div>
    </div>

    <div class="grid-3">
      <div>
        <span class="label">Student Coordinates</span>
        <div class="val-bold">${student.name}</div>
        <div class="val-sub">${student.country}</div>
        <div class="val-sub">${student.phone || ""}</div>
      </div>
      <div>
        <span class="label">Cohort Assignment</span>
        <div class="val-bold">${student.classType === "group" ? `Group (${student.groupName})` : "Private (1-on-1)"}</div>
        <div class="val-sub">Instructor: ${student.instructor || "Assigned Teacher"}</div>
        <div class="val-sub">Schedule: ${student.classTimeIST} IST</div>
      </div>
      <div>
        <span class="label">Billing Cycle Period</span>
        <div class="val-bold">${cycleStartStr}</div>
        <div class="val-sub">to ${cycleEndStr}</div>
        <div class="val-sub">30 Days Clamped</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: center;">Cycle Frequency</th>
          <th style="text-align: right;">Amount (INR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div class="desc-title">Yoga Practice & Asana Guidance Cohort Membership</div>
            <div class="desc-sub">Personalized live instruction, attendance logging, and timezone alignment.</div>
          </td>
          <td style="text-align: center; font-family: monospace;">30-Day Cycle</td>
          <td style="text-align: right; font-family: monospace; font-weight: bold;">${amountStr}</td>
        </tr>
        <tr class="total-row">
          <td colspan="2" style="text-align: right; font-family: monospace; text-transform: uppercase;">Total Settlement Settled:</td>
          <td style="text-align: right; font-family: monospace;">${amountStr}</td>
        </tr>
      </tbody>
    </table>

    <div class="footer-box">
      <div>
        <div style="font-weight: bold;">Payment Method: Direct Verified Settlement</div>
        <div style="color: #6B706E; margin-top: 2px;">Payee UPI ID: <code>${paymentSettings?.upiId || "devbhoomi@upi"}</code></div>
        <div style="color: #6B706E;">Bank: ${paymentSettings?.bankName || "HDFC Bank Ltd"} (A/C: ${paymentSettings?.accountNumber || "50200084729112"})</div>
      </div>
      <div class="stamp-box">
        DEVBHOOMI INFOTECH<br>
        <span style="font-size: 8.5px; font-weight: normal; color: #6B706E;">DIGITAL VALIDATED STAMP</span>
      </div>
    </div>

    <div class="terms">
      This voucher constitutes an official practice tuition settlement receipt issued under Devbhoomi Infotech Studio Infrastructure.<br>
      Tuition covers a 30-day cohort period and is non-refundable upon commencement.
    </div>
  </div>
  <script>
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
