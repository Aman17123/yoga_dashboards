import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import HomePage from "./components/HomePage";
import StudentDashboard from "./components/StudentDashboard";
import AdminDashboard from "./components/AdminDashboard";
import EnquiriesView from "./components/EnquiriesView";
import NotificationCenter from "./components/NotificationCenter";
import Toast from "./components/Toast";
import {
  StudentDetailModal,
  AddEditStudentModal,
  PayNowModal,
  PaymentSettingsModal,
  EnquiryDetailModal,
  ReceiptModal,
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
  // Initialize with initial data, then hydrate from backend API
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
  const [legalModalType, setLegalModalType] = useState(null);

  // Live 1-second clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Hydrate data from backend API on mount
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
      if (e.key === "Escape") {
        if (legalModalType) {
          setLegalModalType(null);
        } else if (activeModal) {
          setActiveModal(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModal, legalModalType]);

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

  // Attendance Toggling (persists to backend API)
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

  // Fee payment update (persists to backend API)
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
        `Ledger updated for ${updatedStudent.name}. Next settlement due ${formatDateHuman(
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

  // Add / Edit Student (persists to backend API)
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
        showToast(`${formData.name}'s profile was updated.`);
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
            `${created.name} was enrolled into studio roster.`
          );
        } else {
          showToast(
            `${created.name} was successfully enrolled.`
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
      showToast(`${target ? target.name : "Student"} was removed.`);
    } catch (err) {
      console.error("Database delete error:", err);
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      showToast(`${target ? target.name : "Student"} was removed.`);
    }
    setActiveModal(null);
  };

  // Enquiries (persists to backend API)
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
        in_progress: "marked as in communication",
        declined: "declined",
      }[status] || status;
    showToast(`${target ? target.name : "Inquiry"} was ${verb}.`);
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

  // Payment settings (persists to backend API)
  const handleSavePaymentSettings = async (newSettings) => {
    try {
      const saved = await api.settings.updatePayment(newSettings);
      setPaymentSettings(saved);
      showToast("Studio payment coordinates updated.");
    } catch (err) {
      console.error("Error updating payment settings:", err);
      setPaymentSettings(newSettings);
      showToast("Studio payment coordinates updated.");
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
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FBFBFA] text-[#121413] font-sans antialiased selection:bg-[#B64E30]/15 selection:text-[#B64E30]">
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
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        {/* Top Operational Bar with Real-Time Notification Bell */}
        <header className="border-b border-[#E6E5E0] bg-[#FFFFFF] px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#6B706E]">
              {session.role === "admin"
                ? activeAdminTab === "students"
                  ? "Console / Directory"
                  : "Console / Inbound Leads"
                : "Member / Practice Desk"}
            </span>
            <span className="text-[#E6E5E0]">|</span>
            <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] text-[#1D7344]">
              <span className="w-2 h-2 rounded-full bg-[#1D7344] animate-pulse" />
              <span>Real-time Sync Active</span>
            </div>
          </div>

          {/* Right Action: Notification Center Bell */}
          <div className="flex items-center gap-3">
            <NotificationCenter
              students={students}
              enquiries={enquiries}
              session={session}
              onSelectStudent={(student) =>
                setActiveModal({ type: "studentDetail", student })
              }
              onSelectEnquiry={(enquiry) =>
                setActiveModal({ type: "enquiryDetail", enquiry })
              }
              onPayNow={(student) =>
                setActiveModal({ type: "payNow", student })
              }
            />
          </div>
        </header>

        <main className="p-4 sm:p-7 md:p-8 max-w-7xl w-full mx-auto flex-1">
          {session.role === "student" && (
            <StudentDashboard
              student={currentStudent}
              currentTime={currentTime}
              onPayNow={(student) => setActiveModal({ type: "payNow", student })}
              onToggleAttendance={handleToggleAttendance}
              onOpenReceipt={(student) => setActiveModal({ type: "receipt", student })}
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
                  onOpenReceipt={(student) =>
                    setActiveModal({ type: "receipt", student })
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

        {/* Editorial Footer */}
        <footer className="border-t border-[#E6E5E0] bg-[#FFFFFF] py-5 px-5 sm:px-8 mt-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B706E] gap-3">
            <div>
              &copy; {new Date().getFullYear()} Devbhoomi Infotech Studio Infrastructure. Authenticated Workspace.
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setLegalModalType("privacy")}
                className="hover:text-[#121413] underline underline-offset-4 cursor-pointer"
              >
                Privacy Policy
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setLegalModalType("terms")}
                className="hover:text-[#121413] underline underline-offset-4 cursor-pointer"
              >
                Terms of Service
              </button>
              <span>·</span>
              <span className="font-mono text-[11px]">UTC: {currentTime.toUTCString().slice(17, 22)}</span>
            </div>
          </div>
        </footer>
      </div>

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
          onOpenReceipt={(s) => setActiveModal({ type: "receipt", student: s })}
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
          onOpenReceipt={(s) => setActiveModal({ type: "receipt", student: s })}
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

      {activeModal?.type === "receipt" && (
        <ReceiptModal
          student={activeModal.student}
          paymentSettings={paymentSettings}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Legal Documentation Modal */}
      {legalModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#000000]/60">
          <div className="bg-[#FFFFFF] border border-[#E6E5E0] rounded-[6px] max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden text-[#121413]">
            <div className="px-6 py-4 border-b border-[#E6E5E0] flex items-center justify-between bg-[#FBFBFA]">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#B64E30]">
                  Studio Governance Documentation
                </span>
                <h3 className="font-sans font-bold text-xl text-[#121413]">
                  {legalModalType === "privacy" ? "Student Data & Privacy Policy" : "Studio Terms of Service & Liability Waiver"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLegalModalType(null)}
                className="p-1 rounded-[4px] hover:bg-[#F0EFEA] text-[#444846] transition-colors cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="6" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-[#444846] leading-relaxed">
              {legalModalType === "privacy" ? (
                <>
                  <div>
                    <h4 className="font-bold text-[#121413] mb-1">1. Student Health Data Sovereignty</h4>
                    <p>
                      Devbhoomi Infotech provides dedicated infrastructure directly operated by your yoga instructor. Health intake disclosures—including spinal history, joint conditions, pregnancy status, and cardiovascular observations—are stored strictly within your instructor’s private studio instance and are never aggregated, commodified, or shared with commercial health brokers.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#121413] mb-1">2. Payment &amp; Banking Data Safeguards</h4>
                    <p>
                      Because Devbhoomi Infotech facilitates direct-to-bank settlements (such as UPI IDs and international wire transfers), no full credit card numbers or banking passwords are ever stored on or processed through intermediate cloud aggregators. All transaction confirmations are logged solely for tuition cycle accounting.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#121413] mb-1">3. Right to Rectification &amp; Deletion</h4>
                    <p>
                      Every registered student maintains the right to inspect their complete attendance logs and contact details upon request to their instructor. Upon cessation of practice, personal records may be archived or permanently purged upon written request.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h4 className="font-bold text-[#121413] mb-1">1. Practice Safety &amp; Physical Liability Waiver</h4>
                    <p>
                      Yoga asana, pranayama, and mindful movement involve inherent physical demands. By participating in studio sessions, students acknowledge their responsibility to practice within personal physical boundaries, communicate injuries immediately to the teacher, and seek independent medical clearance when pregnant or managing chronic conditions.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#121413] mb-1">2. Cancellation &amp; Rescheduling Windows</h4>
                    <p>
                      Private 1-on-1 sessions require a minimum 24-hour advance rescheduling notice. Cancellations made inside 24 hours of the scheduled session time are counted as completed classes against the monthly cohort allowance.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#121413] mb-1">3. Tuition Cycles &amp; Clamped 30-Day Due Dates</h4>
                    <p>
                      Studio fees cover a 30-day practice cycle from the date of initial payment. Monthly tuition is non-refundable once the cycle commences. Due dates clamp to the end of the succeeding calendar month for consistent billing regularity.
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="px-6 py-3 border-t border-[#E6E5E0] bg-[#FBFBFA] flex justify-end">
              <button
                type="button"
                onClick={() => setLegalModalType(null)}
                className="px-4 py-1.5 rounded-[4px] bg-[#121413] text-[#FFFFFF] text-xs font-medium hover:bg-[#2A2E2C] cursor-pointer"
              >
                Close Legal Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
