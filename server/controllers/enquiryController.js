import { Enquiry } from "../models/Enquiry.js";
import { emitRealtimeEvent } from "../index.js";

export async function getAllEnquiries(req, res) {
  try {
    const enquiries = await Enquiry.find().sort({ id: 1 });
    return res.json(enquiries.map((q) => q.toJSON()));
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    return res.status(500).json({ error: "Failed to retrieve enquiries." });
  }
}

export async function createEnquiry(req, res) {
  try {
    const formData = req.body;
    const maxEnquiry = await Enquiry.findOne().sort({ id: -1 });
    const nextId = maxEnquiry ? maxEnquiry.id + 1 : 1;

    const todayISO = new Date().toISOString().split("T")[0];

    const newEnquiry = new Enquiry({
      id: nextId,
      ...formData,
      status: "pending",
      submittedDate: formData.submittedDate || todayISO,
      convertedStudentId: null,
    });

    await newEnquiry.save();
    const enquiryJson = newEnquiry.toJSON();

    emitRealtimeEvent("enquiry:created", { enquiry: enquiryJson });
    emitRealtimeEvent("stats:updated", {});

    return res.status(201).json(enquiryJson);
  } catch (error) {
    console.error("Error creating enquiry:", error);
    return res.status(500).json({ error: "Failed to create enquiry." });
  }
}

export async function updateEnquiryStatus(req, res) {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!["pending", "in_progress", "accepted", "declined"].includes(status)) {
      return res.status(400).json({ error: "Invalid enquiry status." });
    }

    const updated = await Enquiry.findOneAndUpdate(
      { id },
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Enquiry not found." });
    }

    const enquiryJson = updated.toJSON();
    emitRealtimeEvent("enquiry:updated", { enquiry: enquiryJson });
    emitRealtimeEvent("stats:updated", {});

    return res.json(enquiryJson);
  } catch (error) {
    console.error("Error updating enquiry status:", error);
    return res.status(500).json({ error: "Failed to update enquiry status." });
  }
}
