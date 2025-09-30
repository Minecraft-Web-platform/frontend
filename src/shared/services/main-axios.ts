import axios from "axios";
import useAuthStore from "../../store/auth.store";

export const mainAxios = axios.create({
  withCredentials: true,
});

const SERVER_URL = import.meta.env.VITE_BACKEND_URL;

mainAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const { refreshToken, login, logout } = useAuthStore.getState();
      const urlToServer = SERVER_URL + "/auth/refresh/";

      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(urlToServer, undefined, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });
        const newAT = response.data;

        login(newAT, refreshToken);

        originalRequest.headers.Authorization = `Bearer ${newAT}`;

        return mainAxios(originalRequest);
      } catch (refreshError) {
        logout();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
