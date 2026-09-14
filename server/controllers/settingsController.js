import { pool } from "../db/pool.js";
import { formatSettings } from "../db/serializer.js";

const DEFAULT_SETTINGS = {
  id: 1,
  upi_id: "yogaonlive@upi",
  payee_name: "yogaonlive Studio",
  account_name: "yogaonlive",
  account_number: "000000000000",
  ifsc: "ABCD0123456",
  bank_name: "State Bank of India",
  admin_whats_app: "+91 90000 00000",
};

export async function getPaymentSettings(req, res) {
  try {
    let [rows] = await pool.execute(
      "SELECT * FROM payment_settings WHERE id = 1"
    );

    if (!rows || rows.length === 0) {
      await pool.execute(
        `INSERT INTO payment_settings (id, upi_id, payee_name, account_name, account_number, ifsc, bank_name, admin_whats_app)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE id=id`,
        [
          DEFAULT_SETTINGS.id,
          DEFAULT_SETTINGS.upi_id,
          DEFAULT_SETTINGS.payee_name,
          DEFAULT_SETTINGS.account_name,
          DEFAULT_SETTINGS.account_number,
          DEFAULT_SETTINGS.ifsc,
          DEFAULT_SETTINGS.bank_name,
          DEFAULT_SETTINGS.admin_whats_app,
        ]
      );
      [rows] = await pool.execute(
        "SELECT * FROM payment_settings WHERE id = 1"
      );
    }

    const [links] = await pool.execute(
      "SELECT cohort_key, meet_url FROM payment_settings_group_links"
    );

    return res.json(formatSettings(rows[0], links));
  } catch (error) {
    console.error("Error fetching payment settings:", error);
    return res.status(500).json({ error: "Failed to retrieve payment settings." });
  }
}

export async function updatePaymentSettings(req, res) {
  try {
    const data = req.body || {};

    // Build dynamic update query for payment_settings
    const fields = [];
    const values = [];

    if (data.upiId !== undefined) {
      fields.push("upi_id = ?");
      values.push(data.upiId);
    }
    if (data.payeeName !== undefined) {
      fields.push("payee_name = ?");
      values.push(data.payeeName);
    }
    if (data.accountName !== undefined) {
      fields.push("account_name = ?");
      values.push(data.accountName);
    }
    if (data.accountNumber !== undefined) {
      fields.push("account_number = ?");
      values.push(data.accountNumber);
    }
    if (data.ifsc !== undefined) {
      fields.push("ifsc = ?");
      values.push(data.ifsc);
    }
    if (data.bankName !== undefined) {
      fields.push("bank_name = ?");
      values.push(data.bankName);
    }
    if (data.adminWhatsApp !== undefined) {
      fields.push("admin_whats_app = ?");
      values.push(data.adminWhatsApp);
    }

    if (fields.length > 0) {
      values.push(1);
      await pool.execute(
        `UPDATE payment_settings SET ${fields.join(", ")} WHERE id = ?`,
        values
      );
    }

    // Handle groupClassLinks update if provided
    if (data.groupClassLinks && typeof data.groupClassLinks === "object") {
      for (const [cohortKey, meetUrl] of Object.entries(data.groupClassLinks)) {
        if (cohortKey && meetUrl !== undefined) {
          await pool.execute(
            `INSERT INTO payment_settings_group_links (cohort_key, meet_url)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE meet_url = VALUES(meet_url)`,
            [cohortKey.trim().toLowerCase(), String(meetUrl).trim()]
          );
        }
      }
    }

    const [rows] = await pool.execute(
      "SELECT * FROM payment_settings WHERE id = 1"
    );
    const [links] = await pool.execute(
      "SELECT cohort_key, meet_url FROM payment_settings_group_links"
    );

    return res.json(formatSettings(rows[0], links));
  } catch (error) {
    console.error("Error updating payment settings:", error);
    return res.status(500).json({ error: "Failed to update payment settings." });
  }
}
