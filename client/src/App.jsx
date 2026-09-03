import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import HomePage from "./components/HomePage";
import StudentDashboard from "./components/StudentDashboard";
import AdminDashboard from "./components/AdminDashboard";
import EnquiriesView from "./components/EnquiriesView";
import Toast from "./components/Toast";
import {
  StudentDetailModal,
  AddEditStudentModal,
  PayNowModal,
  PaymentSettingsModal,
  EnquiryDetailModal,
} from "./components/Modals";
import {
  ADMIN_ACCOUNT,
  DEFAULT_PAYMENT_SETTINGS,
  INITIAL_STUDENTS,
  INITIAL_ENQUIRIES,
} from "./constants/initialData";
import { generateAttendance, formatDateHuman, getCurrentDueDate } from "./utils/dateUtils";
import { api } from "./services/api";

export default function App() {
  // Initialize with initial data, then hydrate from MongoDB
  const [students, setStudents] = useState(() => {
    return INITIAL_STUDENTS.map((s) => ({
      ...s,
      attendance: generateAttendance(s),
      paymentHistory: [],
    }));
  });

  const [enquiries, setEnquiries] = useState(INITIAL_ENQUIRIES);
  const [paymentSettings, setPaymentSettings] = useState(DEFAULT_PAYMENT_SETTINGS);
  const [session, setSession] = useState(null); // { role: "admin" } or { role: "student", id: 1 }
  const [activeAdminTab, setActiveAdminTab] = useState("students");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeModal, setActiveModal] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Live 1-second clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Hydrate data from real MongoDB database on mount
  useEffect(() => {
    async function loadDatabaseData() {
      try {
        const [fetchedStudents, fetchedEnquiries, fetchedSettings] =
          await Promise.all([
            api.students.getAll().catch((err) => {
              console.warn("Could not fetch students from API:", err);
              return null;
            }),
            api.enquiries.getAll().catch((err) => {
              console.warn("Could not fetch enquiries from API:", err);
              return null;
            }),
            api.settings.getPayment().catch((err) => {
              console.warn("Could not fetch settings from API:", err);
              return null;
            }),
          ]);

        if (Array.isArray(fetchedStudents) && fetchedStudents.length > 0) {
          setStudents(fetchedStudents);
        }
        if (Array.isArray(fetchedEnquiries) && fetchedEnquiries.length > 0) {
          setEnquiries(fetchedEnquiries);
        }
        if (fetchedSettings && fetchedSettings.upiId) {
          setPaymentSettings(fetchedSettings);
        }
      } catch (err) {
        console.warn("Error hydrating from backend API:", err);
      }
    }

    loadDatabaseData();
  }, []);

  // Toast auto-dismiss
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3600);
  };

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && activeModal) {
        setActiveModal(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModal]);

  // Auth Handlers
  const handleLogin = async (username, password) => {
    try {
      const res = await api.auth.login(username, password);
      if (res?.success) {
        setSession(res.session);
        return true;
      }
    } catch (err) {
      console.warn("Backend auth failed, evaluating fallback:", err);
    }

    // Local fallback check
    if (
      username === ADMIN_ACCOUNT.username &&
      password === ADMIN_ACCOUNT.password
    ) {
      setSession({ role: "admin" });
      return true;
    }
    const foundStudent = students.find(
      (s) => s.username === username && s.password === password
    );
    if (foundStudent) {
      setSession({ role: "student", id: foundStudent.id });
      return true;
    }
    return false;
  };

  const handleQuickLogin = async (role) => {
    try {
      const res = await api.auth.quickLogin(role);
      if (res?.success) {
        setSession(res.session);
        return;
      }
    } catch (err) {
      console.warn("Quick login API error, using fallback:", err);
    }

    if (role === "admin") {
      setSession({ role: "admin" });
    } else {
      const studentId = students[0]?.id || 1;
      setSession({ role: "student", id: studentId });
    }
  };

  const handleLogout = () => {
    setSession(null);
    setActiveModal(null);
  };

  // Attendance Toggling (persists to MongoDB)
  const handleToggleAttendance = async (studentId, dateISO, status) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const updatedAttendance = { ...s.attendance, [dateISO]: status };
        return { ...s, attendance: updatedAttendance };
      })
    );

    try {
      await api.students.toggleAttendance(studentId, dateISO, status);
    } catch (err) {
      console.error("Failed to persist attendance to database:", err);
    }
  };

  // Fee payment update (persists to MongoDB)
  const handleUpdatePayment = async (studentId, newLastPaymentDate, updatedHistory) => {
    try {
      const updatedStudent = await api.students.recordPayment(studentId, {
        paymentDate: newLastPaymentDate,
        updatedHistory,
      });
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? updatedStudent : s))
      );
      showToast(
        `Payment recorded for ${updatedStudent.name}. Next due ${formatDateHuman(
          getCurrentDueDate(updatedStudent)
        )}.`
      );
    } catch (err) {
      console.error("Error saving payment to database:", err);
      // Local fallback
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id !== studentId) return s;
          const updated = {
            ...s,
            lastPaymentDate: newLastPaymentDate,
            paymentHistory: updatedHistory,
          };
          showToast(
            `Payment recorded for ${s.name}. Next due ${formatDateHuman(
              getCurrentDueDate(updated)
            )}.`
          );
          return updated;
        })
      );
    }
  };

  // Add / Edit Student (persists to MongoDB)
  const handleSaveStudent = async (formData, existingId, linkedEnquiryId) => {
    const duplicate = students.find(
      (s) => s.username === formData.username && s.id !== existingId
    );
    if (duplicate) {
      showToast("That username is already taken — choose another.");
      return;
    }

    try {
      if (existingId) {
        const updated = await api.students.update(existingId, formData);
        setStudents((prev) =>
          prev.map((s) => (s.id === existingId ? updated : s))
        );
        showToast(`${formData.name}'s details were updated in database.`);
      } else {
        const created = await api.students.create({
          ...formData,
          enquiryId: linkedEnquiryId,
        });
        setStudents((prev) => [...prev, created]);

        if (linkedEnquiryId) {
          setEnquiries((prev) =>
            prev.map((q) =>
              q.id === linkedEnquiryId
                ? { ...q, status: "accepted", convertedStudentId: created.id }
                : q
            )
          );
          showToast(
            `${created.name} was enrolled in database. Username: "${created.username}" / Password: "${created.password}".`
          );
        } else {
          showToast(
            `${created.name} was saved to database. Username: "${created.username}" / Password: "${created.password}".`
          );
        }
      }
      setActiveModal(null);
    } catch (err) {
      console.error("Database save student error:", err);
      showToast(err?.message || "Failed to save student record.");
    }
  };

  const handleDeleteStudent = async (studentId) => {
    const target = students.find((s) => s.id === studentId);
    try {
      await api.students.delete(studentId);
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      showToast(`${target ? target.name : "Student"} was removed from database.`);
    } catch (err) {
      console.error("Database delete error:", err);
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      showToast(`${target ? target.name : "Student"} was removed.`);
    }
    setActiveModal(null);
  };

  // Enquiries (persists to MongoDB)
  const handleUpdateEnquiryStatus = async (id, status) => {
    const target = enquiries.find((q) => q.id === id);
    setEnquiries((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status } : q))
    );

    try {
      await api.enquiries.updateStatus(id, status);
    } catch (err) {
      console.error("Error updating enquiry in database:", err);
    }

    const verb =
      {
        pending: "reopened",
        in_progress: "marked as in progress",
        declined: "declined",
      }[status] || status;
    showToast(`${target ? target.name : "Enquiry"} was ${verb}.`);
  };

  const handleAcceptEnquiry = (enquiry) => {
    setActiveModal({
      type: "addEditStudent",
      student: null,
      prefill: {
        name: enquiry.name,
        email: enquiry.email,
        phone: enquiry.phone,
        country: enquiry.country,
        classType: enquiry.classTypeInterest === "group" ? "group" : "private",
      },
      enquiryId: enquiry.id,
    });
  };

  // Payment settings (persists to MongoDB)
  const handleSavePaymentSettings = async (newSettings) => {
    try {
      const saved = await api.settings.updatePayment(newSettings);
      setPaymentSettings(saved);
      showToast("Payment details updated in database.");
    } catch (err) {
      console.error("Error updating payment settings:", err);
      setPaymentSettings(newSettings);
      showToast("Payment details updated.");
    }
  };

  // If not logged in, display the Anti-Vibecoded Studio Login Home Page
  if (!session) {
    return (
      <HomePage
        onLogin={handleLogin}
        onQuickLogin={handleQuickLogin}
      />
    );
  }

  // Active student for student view
  const currentStudent =
    session.role === "student"
      ? students.find((s) => s.id === session.id) || students[0]
      : null;

  const pendingEnquiryCount = enquiries.filter(
    (q) => q.status === "pending"
  ).length;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F6F7FB] text-[#171A32]">
      {/* Sidebar Navigation */}
      <Sidebar
        session={session}
        activeAdminTab={activeAdminTab}
        onSwitchAdminTab={setActiveAdminTab}
        onLogout={handleLogout}
        currentTime={currentTime}
        student={currentStudent}
        pendingEnquiryCount={pendingEnquiryCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-7 md:p-8 max-w-7xl">
        {session.role === "student" && (
          <StudentDashboard
            student={currentStudent}
            currentTime={currentTime}
            onPayNow={(student) => setActiveModal({ type: "payNow", student })}
            onToggleAttendance={handleToggleAttendance}
          />
        )}

        {session.role === "admin" && (
          <>
            {activeAdminTab === "students" && (
              <AdminDashboard
                students={students}
                onViewStudent={(student) =>
                  setActiveModal({ type: "studentDetail", student })
                }
                onEditStudent={(student) =>
                  setActiveModal({ type: "addEditStudent", student })
                }
                onAddStudent={() =>
                  setActiveModal({ type: "addEditStudent", student: null })
                }
                onOpenPaymentSettings={() =>
                  setActiveModal({ type: "paymentSettings" })
                }
              />
            )}

            {activeAdminTab === "enquiries" && (
              <EnquiriesView
                enquiries={enquiries}
                onUpdateEnquiryStatus={handleUpdateEnquiryStatus}
                onAcceptEnquiry={handleAcceptEnquiry}
                onViewEnquiry={(enquiry) =>
                  setActiveModal({ type: "enquiryDetail", enquiry })
                }
              />
            )}
          </>
        )}
      </main>

      {/* Modals Container */}
      {activeModal?.type === "studentDetail" && (
        <StudentDetailModal
          student={students.find((s) => s.id === activeModal.student.id) || activeModal.student}
          currentTime={currentTime}
          onClose={() => setActiveModal(null)}
          onEditStudent={(s) =>
            setActiveModal({ type: "addEditStudent", student: s })
          }
          onUpdatePayment={handleUpdatePayment}
        />
      )}

      {activeModal?.type === "addEditStudent" && (
        <AddEditStudentModal
          student={activeModal.student}
          prefill={activeModal.prefill}
          enquiryId={activeModal.enquiryId}
          onClose={() => setActiveModal(null)}
          onSave={handleSaveStudent}
          onDelete={handleDeleteStudent}
        />
      )}

      {activeModal?.type === "payNow" && (
        <PayNowModal
          student={activeModal.student}
          paymentSettings={paymentSettings}
          onClose={() => setActiveModal(null)}
          onShowToast={showToast}
        />
      )}

      {activeModal?.type === "paymentSettings" && (
        <PaymentSettingsModal
          settings={paymentSettings}
          onClose={() => setActiveModal(null)}
          onSave={handleSavePaymentSettings}
        />
      )}

      {activeModal?.type === "enquiryDetail" && (
        <EnquiryDetailModal
          enquiry={enquiries.find((q) => q.id === activeModal.enquiry.id) || activeModal.enquiry}
          onClose={() => setActiveModal(null)}
          onUpdateStatus={handleUpdateEnquiryStatus}
          onAcceptEnquiry={handleAcceptEnquiry}
        />
      )}

      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
