import axios, { InternalAxiosRequestConfig } from "axios";
import useAuthStore from "../../store/auth.store";

export const mainAxios = axios.create({
  withCredentials: true,
});

const SERVER_URL = import.meta.env.VITE_BACKEND_URL;

let isRefreshing = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

mainAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return mainAxios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken, login, logout } = useAuthStore.getState();
      const urlToServer = SERVER_URL + "/auth/refresh/";

      if (!refreshToken) {
        logout();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(urlToServer, undefined, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });
        const newAT = response.data;

        login(newAT, refreshToken);
        originalRequest.headers.Authorization = `Bearer ${newAT}`;
        processQueue(null, newAT);
        
        return mainAxios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 403 && error.response?.data?.message === 'BANNED') {
      const { setBanInfo } = useAuthStore.getState();
      setBanInfo(true, error.response.data.reason);
    }

    return Promise.reject(error);
  }
);
