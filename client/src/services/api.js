const call = async (path, { method = 'GET', body } = {}) => {
  const token = localStorage.getItem('sp_token');
  const res = await fetch(`/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Request failed');
  return json.data;
};

export const api = {
  // Auth
  login: (b) => call('/auth/login', { method: 'POST', body: b }),
  register: (b) => call('/auth/register', { method: 'POST', body: b }),
  me: () => call('/auth/me'),
  savedVehicles: () => call('/auth/vehicles'),
  saveVehicle: (b) => call('/auth/vehicles', { method: 'POST', body: b }),

  // Parking
  search: (qs) => call(`/parking?${new URLSearchParams(qs)}`),
  parking: (id) => call(`/parking/${id}`),
  availability: (id, s, e) => call(`/parking/${id}/availability?start=${s}&end=${e}`),
  slots: (id, s, e) => call(`/parking/${id}/slots?start=${s}&end=${e}`),
  reviews: (id) => call(`/parking/${id}/reviews`),
  addReview: (id, b) => call(`/parking/${id}/reviews`, { method: 'POST', body: b }),
  createParking: (b) => call('/parking', { method: 'POST', body: b }),

  // Bookings & Lifecycle
  book: (b) => call('/bookings', { method: 'POST', body: b }),
  bookingDetails: (id) => call(`/bookings/${id}`),
  myBookings: () => call('/bookings'),
  pay: (id, b) => call(`/bookings/${id}/pay`, { method: 'PATCH', body: b }),
  checkin: (id) => call(`/bookings/${id}/checkin`, { method: 'PATCH' }),
  checkout: (id) => call(`/bookings/${id}/checkout`, { method: 'PATCH' }),
  cancel: (id) => call(`/bookings/${id}/cancel`, { method: 'PATCH' }),

  // Dashboards
  ownerParking: () => call('/owner/parking'),
  ownerStats: () => call('/owner/dashboard'),
  adminStats: () => call('/admin/dashboard'),
  adminPending: () => call('/admin/parking?status=PENDING_APPROVAL'),
  approve: (id) => call(`/admin/parking/${id}/approve`, { method: 'PATCH' }),
  reject: (id, reason) => call(`/admin/parking/${id}/reject`, { method: 'PATCH', body: { reason } }),
};
