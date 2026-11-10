// Client de l'API Discover Morocco. Le jeton de session est gardé dans le navigateur.

const TOKEN_KEY = 'dm_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

export class ApiError extends Error {
  constructor(status, code) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

async function request(method, path, body) {
  const token = getToken();
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'network_error');
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data?.error?.code ?? 'server_error');
  return data;
}

const query = (params) => {
  const search = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''));
  return search.size ? '?' + search : '';
};

export const api = {
  config: () => request('GET', '/config'),
  register: (body) => request('POST', '/auth/register', body),
  login: (body) => request('POST', '/auth/login', body),
  google: (credential, language) => request('POST', '/auth/google', { credential, language }),
  me: () => request('GET', '/auth/me'),
  updateMe: (body) => request('PATCH', '/auth/me', body),
  setLanguage: (language) => request('PATCH', '/auth/me', { language }),
  changePassword: (currentPassword, newPassword) => request('POST', '/auth/password', { currentPassword, newPassword }),
  deleteAccount: (password) => request('DELETE', '/auth/me', { password }),
  destinations: (params = {}) => request('GET', '/destinations' + query(params)),
  places: (id) => request('GET', '/destinations/' + id + '/places'),
  reviews: (id) => request('GET', '/destinations/' + id + '/reviews'),
  saveReview: (id, body) => request('PUT', '/destinations/' + id + '/review', body),
  deleteReview: (id) => request('DELETE', '/destinations/' + id + '/review'),
  favorites: () => request('GET', '/favorites'),
  addFavorite: (id) => request('PUT', '/favorites/' + id),
  removeFavorite: (id) => request('DELETE', '/favorites/' + id),
  plan: (trip) => request('POST', '/budget-coach', trip),
  shared: (token) => request('GET', '/shared/' + encodeURIComponent(token)),
  listTrips: () => request('GET', '/trips'),
  getTrip: (id) => request('GET', '/trips/' + id),
  saveTrip: (trip) => request('POST', '/trips', trip),
  deleteTrip: (id) => request('DELETE', '/trips/' + id),
  savePlan: (id, days) => request('PUT', '/trips/' + id + '/plan', { days }),
  expenses: (id) => request('GET', '/trips/' + id + '/expenses'),
  addExpense: (id, body) => request('POST', '/trips/' + id + '/expenses', body),
  deleteExpense: (id, expenseId) => request('DELETE', '/trips/' + id + '/expenses/' + expenseId),
  saveTravelers: (id, travelers) => request('PUT', '/trips/' + id + '/travelers', { travelers }),
};
