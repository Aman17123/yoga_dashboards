import { PaymentSettings } from "../models/PaymentSettings.js";

export async function getPaymentSettings(req, res) {
  try {
    let settings = await PaymentSettings.findOne();
    if (!settings) {
      settings = await PaymentSettings.create({
        upiId: "yogaonlive@upi",
        payeeName: "yogaonlive Studio",
        accountName: "yogaonlive",
        accountNumber: "000000000000",
        ifsc: "ABCD0123456",
        bankName: "State Bank of India",
        adminWhatsApp: "+91 90000 00000",
      });
    }
    return res.json(settings.toJSON());
  } catch (error) {
    console.error("Error fetching payment settings:", error);
    return res.status(500).json({ error: "Failed to retrieve payment settings." });
  }
}

export async function updatePaymentSettings(req, res) {
  try {
    const updated = await PaymentSettings.findOneAndUpdate({}, req.body, {
      new: true,
      upsert: true,
      runValidators: true,
    });
    return res.json(updated.toJSON());
  } catch (error) {
    console.error("Error updating payment settings:", error);
    return res.status(500).json({ error: "Failed to update payment settings." });
  }
}
