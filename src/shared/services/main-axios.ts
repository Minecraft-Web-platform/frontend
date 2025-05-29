import axios from 'axios';
import useAuthStore from '../../store/auth.store';

export const mainAxios = axios.create({
  withCredentials: true,
});

mainAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const { refreshToken, login, logout } =
				useAuthStore.getState();

      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }

      try {
        // TODO: Ask about an endpoint to update RT token :)
        const response = await axios.post('/auth/token/refresh-token/', {
          refresh: refreshToken,
        });
        const { accessToken, refreshToken: newRefreshToken } =
					response.data;

        login(accessToken, newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return mainAxios(originalRequest);
      } catch (refreshError) {
        logout();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
