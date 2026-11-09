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

export const api = {
  register: (body) => request('POST', '/auth/register', body),
  login: (body) => request('POST', '/auth/login', body),
  me: () => request('GET', '/auth/me'),
  setLanguage: (language) => request('PATCH', '/auth/me', { language }),
  destinations: (params = {}) => {
    const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''));
    return request('GET', `/destinations${query.size ? `?${query}` : ''}`);
  },
  favorites: () => request('GET', '/favorites'),
  addFavorite: (id) => request('PUT', `/favorites/${id}`),
  removeFavorite: (id) => request('DELETE', `/favorites/${id}`),
  budgetCoach: (trip) => request('POST', '/budget-coach', trip),
  listTrips: () => request('GET', '/trips'),
  saveTrip: (trip) => request('POST', '/trips', trip),
  deleteTrip: (id) => request('DELETE', `/trips/${id}`),
};
