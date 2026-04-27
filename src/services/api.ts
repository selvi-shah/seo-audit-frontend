import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000'
});

// ── Attach accessToken to every request ───────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auto refresh when accessToken expires ─────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // If 401 and we haven't retried yet
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token — force logout
          localStorage.clear();
          window.location.href = '/';
          return Promise.reject(error);
        }

        // Get new accessToken
        const res = await axios.post('http://localhost:3000/auth/refresh', {
          refreshToken
        });

        const newAccessToken = res.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);

        // Retry original request with new token
        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(original);

      } catch (refreshError) {
        // Refresh failed — force logout
        localStorage.clear();
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;