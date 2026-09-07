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
  },
};
