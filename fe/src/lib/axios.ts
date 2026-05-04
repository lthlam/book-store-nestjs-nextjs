import axios from 'axios';
import { API_URL } from '@/utils/constants';

// ─── Refresh state ────────────────────────────────────────────────────────────

let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

async function doRefresh(): Promise<void> {
  // Gọi refresh endpoint — cookie refresh_token tự động được gửi
  await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
}

function flushQueue() {
  refreshQueue.forEach((cb) => cb());
  refreshQueue = [];
}

function clearQueue() {
  refreshQueue = [];
}

// ─── Shared interceptor ───────────────────────────────────────────────────────

function createInstance(onLogout: () => void) {
  const instance = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Tự động gửi httpOnly cookie với mọi request
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
        error.response?.status !== 401 || 
        originalRequest._retry || 
        originalRequest.url?.includes('/users/login') ||
        originalRequest.url?.includes('/users/signup') ||
        originalRequest.url?.includes('/admins/login')
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        // Đang refresh — xếp hàng chờ rồi retry
        return new Promise((resolve, reject) => {
          refreshQueue.push(() => {
            instance(originalRequest).then(resolve).catch(reject);
          });
        });
      }

      isRefreshing = true;
      try {
        await doRefresh();
        flushQueue();
        return instance(originalRequest);
      } catch {
        clearQueue();
        onLogout();
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    },
  );

  return instance;
}

// ─── User API instance ────────────────────────────────────────────────────────

export const api = createInstance(() => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
});

// ─── Admin API instance ───────────────────────────────────────────────────────

export const adminApi = createInstance(() => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin');
    window.location.href = '/admin-login';
  }
});
