import { PaymentSettings } from "../models/PaymentSettings.js";

export async function getPaymentSettings(req, res) {
  try {
    let settings = await PaymentSettings.findOne();
    if (!settings) {
      settings = await PaymentSettings.create({
        upiId: "meridian.yoga@okhdfcbank",
        payeeName: "Meridian Mindful Living Studio",
        accountName: "Meridian Yoga Practices",
        accountNumber: "50200084729112",
        ifsc: "HDFC0001234",
        bankName: "HDFC Bank Ltd",
        adminWhatsApp: "+91 98200 44556",
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
