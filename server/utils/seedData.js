import { Student } from "../models/Student.js";
import { Enquiry } from "../models/Enquiry.js";
import { PaymentSettings } from "../models/PaymentSettings.js";

const DEFAULT_PAYMENT_SETTINGS = {
  upiId: "meridian.yoga@okhdfcbank",
  payeeName: "Meridian Mindful Living Studio",
  accountName: "Meridian Yoga Practices",
  accountNumber: "50200084729112",
  ifsc: "HDFC0001234",
  bankName: "HDFC Bank Ltd, Indiranagar Branch",
  adminWhatsApp: "+91 98200 44556",
};

const INITIAL_STUDENTS = [
  {
    id: 1,
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    phone: "+971 50 123 4567",
    classType: "private",
    groupName: null,
    instructor: "Rohan Mehta",
    country: "United Arab Emirates",
    timezone: "Asia/Dubai",
    duration: "1 Hour",
    fee: 4500,
    classTimeIST: "19:00",
    scheduleDays: [0, 1, 2, 3, 4, 5, 6],
    joiningDate: "2026-08-13",
    lastPaymentDate: "2026-08-13",
    username: "aarav.sharma",
    password: "aarav123",
  },
  {
    id: 2,
    name: "Emily Carter",
    email: "emily.carter@example.com",
    phone: "+1 917 555 0142",
    classType: "private",
    groupName: null,
    instructor: "Priya Nair",
    country: "United States",
    timezone: "America/New_York",
    duration: "1 Hour",
    fee: 6000,
    classTimeIST: "20:00",
    scheduleDays: [0, 1, 2, 3, 4, 5, 6],
    joiningDate: "2026-01-27",
    lastPaymentDate: "2026-07-27",
    username: "emily.carter",
    password: "emily123",
  },
  {
    id: 3,
    name: "Liam Johnson",
    email: "liam.johnson@example.com",
    phone: "+44 7700 900123",
    classType: "group",
    groupName: "Group A",
    instructor: "Meera Iyer",
    country: "United Kingdom",
    timezone: "Europe/London",
    duration: "1 Hour",
    fee: 2800,
    classTimeIST: "18:00",
    scheduleDays: [1, 3, 5],
    joiningDate: "2025-11-26",
    lastPaymentDate: "2026-07-26",
    username: "liam.johnson",
    password: "liam123",
  },
  {
    id: 4,
    name: "Sophia Wilson",
    email: "sophia.wilson@example.com",
    phone: "+1 416 555 0110",
    classType: "group",
    groupName: "Group A",
    instructor: "Meera Iyer",
    country: "Canada",
    timezone: "America/Toronto",
    duration: "1 Hour",
    fee: 2800,
    classTimeIST: "18:00",
    scheduleDays: [1, 3, 5],
    joiningDate: "2025-12-29",
    lastPaymentDate: "2026-06-29",
    username: "sophia.wilson",
    password: "sophia123",
  },
  {
    id: 5,
    name: "Noah Müller",
    email: "noah.mueller@example.com",
    phone: "+49 151 2345 6789",
    classType: "group",
    groupName: "Group A",
    instructor: "Meera Iyer",
    country: "Germany",
    timezone: "Europe/Berlin",
    duration: "1 Hour",
    fee: 2800,
    classTimeIST: "18:00",
    scheduleDays: [1, 3, 5],
    joiningDate: "2026-01-29",
    lastPaymentDate: "2026-07-29",
    username: "noah.mueller",
    password: "noah123",
  },
  {
    id: 6,
    name: "Haruto Sato",
    email: "haruto.sato@example.com",
    phone: "+81 90 1234 5678",
    classType: "private",
    groupName: null,
    instructor: "Kabir Khan",
    country: "Japan",
    timezone: "Asia/Tokyo",
    duration: "1 Hour",
    fee: 5500,
    classTimeIST: "16:00",
    scheduleDays: [0, 1, 2, 3, 4, 5, 6],
    joiningDate: "2026-08-20",
    lastPaymentDate: "2026-08-20",
    username: "haruto.sato",
    password: "haruto123",
  },
  {
    id: 7,
    name: "Chidinma Okafor",
    email: "chidinma.okafor@example.com",
    phone: "+234 802 123 4567",
    classType: "group",
    groupName: "Group B",
    instructor: "Kabir Khan",
    country: "Nigeria",
    timezone: "Africa/Lagos",
    duration: "1 Hour",
    fee: 2500,
    classTimeIST: "17:30",
    scheduleDays: [2, 4, 6],
    joiningDate: "2026-01-28",
    lastPaymentDate: "2026-07-28",
    username: "chidinma.okafor",
    password: "chidinma123",
  },
  {
    id: 8,
    name: "Wei Zhang",
    email: "wei.zhang@example.com",
    phone: "+65 8123 4567",
    classType: "group",
    groupName: "Group B",
    instructor: "Kabir Khan",
    country: "Singapore",
    timezone: "Asia/Singapore",
    duration: "1 Hour",
    fee: 2500,
    classTimeIST: "17:30",
    scheduleDays: [2, 4, 6],
    joiningDate: "2025-11-30",
    lastPaymentDate: "2026-07-31",
    username: "wei.zhang",
    password: "wei123",
  },
  {
    id: 9,
    name: "Olivia Brown",
    email: "olivia.brown@example.com",
    phone: "+61 412 345 678",
    classType: "private",
    groupName: null,
    instructor: "Rohan Mehta",
    country: "Australia",
    timezone: "Australia/Sydney",
    duration: "1 Hour",
    fee: 5000,
    classTimeIST: "07:00",
    scheduleDays: [0, 1, 2, 3, 4, 5, 6],
    joiningDate: "2026-08-24",
    lastPaymentDate: "2026-08-24",
    username: "olivia.brown",
    password: "olivia123",
  },
  {
    id: 10,
    name: "Ethan Davis",
    email: "ethan.davis@example.com",
    phone: "+1 213 555 0176",
    classType: "group",
    groupName: "Group B",
    instructor: "Kabir Khan",
    country: "United States",
    timezone: "America/Los_Angeles",
    duration: "1 Hour",
    fee: 2500,
    classTimeIST: "17:30",
    scheduleDays: [2, 4, 6],
    joiningDate: "2025-10-25",
    lastPaymentDate: "2026-06-25",
    username: "ethan.davis",
    password: "ethan123",
  },
];

const INITIAL_ENQUIRIES = [
  {
    id: 1,
    name: "Priya Desai",
    gender: "Female",
    age: 34,
    heightWeight: "5'4\" / 68 kg",
    phone: "+91 98200 12345",
    email: "priya.desai@example.com",
    country: "India",
    classTypeInterest: "private",
    preferredTimings: "Mornings, 7–8 AM IST",
    demoDate: "2026-08-29",
    instructorPreference: "Female",
    reason: "Weight Loss",
    otherInfo: "Has mild knee pain, please advise on modifications.",
    message: "Looking for a private instructor for weight loss, prefer a female teacher.",
    status: "pending",
    submittedDate: "2026-08-24",
    convertedStudentId: null,
  },
  {
    id: 2,
    name: "James Whitfield",
    gender: "Male",
    age: 41,
    heightWeight: "5'10\" / 82 kg",
    phone: "+44 7700 900222",
    email: "james.whitfield@example.com",
    country: "United Kingdom",
    classTypeInterest: "group",
    preferredTimings: "Around 8–9 PM IST works for me",
    demoDate: "2026-08-30",
    instructorPreference: "Any",
    reason: "Regular Yoga Practice",
    otherInfo: "",
    message: "Want to join a group class for general fitness.",
    status: "in_progress",
    submittedDate: "2026-08-22",
    convertedStudentId: null,
  },
  {
    id: 3,
    name: "Fatima Al-Sayed",
    gender: "Female",
    age: 29,
    heightWeight: "5'5\" / 60 kg",
    phone: "+971 55 123 9876",
    email: "fatima.alsayed@example.com",
    country: "United Arab Emirates",
    classTypeInterest: "private",
    preferredTimings: "Late night, ~11 PM IST (I'm in Dubai)",
    demoDate: "2026-09-01",
    instructorPreference: "Female",
    reason: "Pre/Post Natal Yoga",
    otherInfo: "6 months pregnant, need a prenatal-safe routine.",
    message: "Looking for prenatal yoga with a certified instructor.",
    status: "pending",
    submittedDate: "2026-08-25",
    convertedStudentId: null,
  },
  {
    id: 4,
    name: "David Kim",
    gender: "Male",
    age: 52,
    heightWeight: "5'8\" / 90 kg",
    phone: "+1 213 555 0199",
    email: "david.kim@example.com",
    country: "United States",
    classTypeInterest: "private",
    preferredTimings: "Mornings IST (evening for me, Pacific time)",
    demoDate: "2026-08-28",
    instructorPreference: "Any",
    reason: "Yoga for Disease (Type 2 Diabetes, High BP)",
    otherInfo: "Doctor recommended yoga for blood pressure management.",
    message: "Need therapeutic yoga for diabetes and blood pressure.",
    status: "declined",
    submittedDate: "2026-08-18",
    convertedStudentId: null,
  },
  {
    id: 5,
    name: "Ananya Rao",
    gender: "Female",
    age: 24,
    heightWeight: "5'3\" / 55 kg",
    phone: "+91 90000 45612",
    email: "ananya.rao@example.com",
    country: "India",
    classTypeInterest: "group",
    preferredTimings: "Weekday evenings, 6–7 PM IST",
    demoDate: "2026-08-27",
    instructorPreference: "Any",
    reason: "Regular Yoga Practice",
    otherInfo: "",
    message: "Want to try group sessions along with a couple of friends.",
    status: "accepted",
    submittedDate: "2026-08-15",
    convertedStudentId: null,
  },
];

function generateAttendance(student) {
  const attendance = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [y, m, d] = (student.joiningDate || "2026-01-01").split("-").map(Number);
  const joinDate = new Date(y, m - 1, d);

  const threshold = new Date(today.getFullYear(), today.getMonth() - 3, 1);
  const rangeStart = new Date(Math.max(joinDate.getTime(), threshold.getTime()));

  let seed = student.id * 7919 + 13;
  function rand() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  }

  const cursor = new Date(rangeStart);
  while (cursor < today) {
    const isClassDay =
      student.classType === "private"
        ? rand() < 0.45
        : (student.scheduleDays || []).includes(cursor.getDay());

    if (isClassDay) {
      const year = cursor.getFullYear();
      const month = String(cursor.getMonth() + 1).padStart(2, "0");
      const day = String(cursor.getDate()).padStart(2, "0");
      const iso = `${year}-${month}-${day}`;
      attendance[iso] = rand() < 0.86 ? "present" : "absent";
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return attendance;
}

export async function seedDatabaseIfEmpty() {
  try {
    const studentCount = await Student.countDocuments();
    if (studentCount === 0) {
      console.log("Seeding initial student records...");
      const studentsToInsert = INITIAL_STUDENTS.map((s) => ({
        ...s,
        attendance: generateAttendance(s),
        paymentHistory: [
          {
            date: s.lastPaymentDate,
            amount: s.fee,
            note: "Initial tuition payment",
            paymentMethod: "UPI / Bank Transfer",
          },
        ],
      }));
      await Student.insertMany(studentsToInsert);
      console.log(`Successfully seeded ${studentsToInsert.length} students.`);
    }

    const enquiryCount = await Enquiry.countDocuments();
    if (enquiryCount === 0) {
      console.log("Seeding initial enquiries...");
      await Enquiry.insertMany(INITIAL_ENQUIRIES);
      console.log(`Successfully seeded ${INITIAL_ENQUIRIES.length} enquiries.`);
    }

    const settingsCount = await PaymentSettings.countDocuments();
    if (settingsCount === 0) {
      console.log("Seeding default payment settings...");
      await PaymentSettings.create(DEFAULT_PAYMENT_SETTINGS);
      console.log("Successfully seeded payment settings.");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
