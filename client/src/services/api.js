const BASE_URL = "/api";

async function request(endpoint, options = {}) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  auth: {
    login: (username, password) =>
      request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }),
    quickLogin: (role) =>
      request("/auth/quick-login", {
        method: "POST",
        body: JSON.stringify({ role }),
      }),
  },

  students: {
    getAll: () => request("/students"),
    getById: (id) => request(`/students/${id}`),
    create: (studentData) =>
      request("/students", {
        method: "POST",
        body: JSON.stringify(studentData),
      }),
    enroll: (enrollData) =>
      request("/students/enroll", {
        method: "POST",
        body: JSON.stringify(enrollData),
      }),
    resendWelcomeEmail: (id) =>
      request(`/students/${id}/resend-welcome-email`, {
        method: "POST",
      }),
    resetPassword: (studentOrId, payload) => {
      const id =
        typeof studentOrId === "object" && studentOrId !== null
          ? studentOrId.id !== undefined
            ? studentOrId.id
            : studentOrId._id
          : studentOrId;
      const body = typeof payload === "string" ? { newPassword: payload } : payload || {};
      return request(`/students/${id}/reset-password`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    updateCredentials: (studentOrId, credentials) => {
      const id =
        typeof studentOrId === "object" && studentOrId !== null
          ? studentOrId.id !== undefined
            ? studentOrId.id
            : studentOrId._id
          : studentOrId;
      return request(`/students/${id}/credentials`, {
        method: "PUT",
        body: JSON.stringify(credentials),
      });
    },
    changePassword: (id, currentPassword, newPassword) =>
      request(`/students/${id}/change-password`, {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
    update: (id, studentData) =>
      request(`/students/${id}`, {
        method: "PUT",
        body: JSON.stringify(studentData),
      }),
    delete: (id) =>
      request(`/students/${id}`, {
        method: "DELETE",
      }),
    toggleAttendance: (id, dateISO, status) =>
      request(`/students/${id}/attendance`, {
        method: "PATCH",
        body: JSON.stringify({ dateISO, status }),
      }),
    recordPayment: (id, payload) =>
      request(`/students/${id}/payments`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  enquiries: {
    getAll: () => request("/enquiries"),
    create: (enquiryData) =>
      request("/enquiries", {
        method: "POST",
        body: JSON.stringify(enquiryData),
      }),
    updateStatus: (id, status) =>
      request(`/enquiries/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    deleteEnrolledStudent: (id, alsoDeleteEnquiry = false) =>
      request(`/enquiries/${id}/enrolled-student?alsoDeleteEnquiry=${Boolean(alsoDeleteEnquiry)}`, {
        method: "DELETE",
      }),
    delete: (id, deleteStudent = false) =>
      request(`/enquiries/${id}?deleteStudent=${Boolean(deleteStudent)}`, {
        method: "DELETE",
      }),
  },

  settings: {
    getPayment: () => request("/settings/payment"),
    updatePayment: (settingsData) =>
      request("/settings/payment", {
        method: "PUT",
        body: JSON.stringify(settingsData),
      }),
  },

  bookings: {
    getAll: () => request("/bookings"),
    create: (bookingData) =>
      request("/bookings", {
        method: "POST",
        body: JSON.stringify(bookingData),
      }),
    updateStatus: (id, status, adminNotes) =>
      request(`/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, adminNotes }),
      }),
    deleteEnrolledStudent: (id, alsoDeleteBooking = false) =>
      request(`/bookings/${id}/enrolled-student?alsoDeleteBooking=${Boolean(alsoDeleteBooking)}`, {
        method: "DELETE",
      }),
    delete: (id, deleteStudent = false) =>
      request(`/bookings/${id}?deleteStudent=${Boolean(deleteStudent)}`, {
        method: "DELETE",
      }),
  },
};
