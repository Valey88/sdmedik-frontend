import axios from "axios";
import useUserStore from "../store/userStore";

const url = import.meta.env.VITE_URL_SERVER;
export const urlPictures = import.meta.env.VITE_URL_PICTURES;

// Создаем экземпляр axios
const api = axios.create({
  baseURL: `${url}`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если ошибка 401 и не запрос на обновление токена
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url.includes("/auth/refresh")) {
        await useUserStore.getState().logout();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;

          // Вызываем обновление токена
          await useUserStore.getState().refreshToken();

          // Обновляем состояние аутентификации
          useUserStore.getState().setIsAuthenticated(true);

          isRefreshing = false;
          processQueue(null);
        }

        // Повторяем оригинальный запрос
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      } catch (refreshError) {
        processQueue(refreshError);
        await useUserStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
