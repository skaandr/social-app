import axios from 'axios';

export const TOKEN_KEY = 'connectly_token';
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://route-posts.routemisr.com';

const client = axios.create({ baseURL: BASE_URL, timeout: 30000 });

// Attach the bearer token to every request (JSON and multipart alike).
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Notify the app when the session is no longer valid.
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config?.skipAuthExpiry) {
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(err);
  }
);

/** The API wraps everything as { success, message, data, meta }. */
export const unwrap = (res) => res.data;

export function getErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  if (!err) return fallback;
  if (err.code === 'ERR_NETWORK') return 'Cannot reach the server. Check your connection and try again.';
  if (err.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
  const data = err.response?.data;
  if (data) {
    const list = Array.isArray(data.errors) ? data.errors.map((e) => (typeof e === 'string' ? e : e?.message)).filter(Boolean) : [];
    if (list.length) return list.join(' • ');
    if (data.message) return typeof data.message === 'string' ? data.message : fallback;
  }
  return err.message || fallback;
}

export default client;
