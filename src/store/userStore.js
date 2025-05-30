import { create } from "zustand";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import api from "../configs/axiosConfig";

const useUserStore = create((set, get) => ({
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null,
  allUsers: [],
  isLoggedOut: false,
  isRefreshingToken: false,
  isLoggingOut: false,
  email: "",
  fio: "",
  password: "",
  confirmPassword: "",
  phone_number: "",
  showConfirmation: false,
  code: "",
  isAuthenticated: !!Cookies.get("logged_in"),
  setEmail: (email) => set({ email }),
  setFio: (fio) => set({ fio }),
  setPhone_number: (phone_number) => set({ phone_number }),
  setPassword: (password) => set({ password }),
  setConfirmPassword: (confirmPassword) => set({ confirmPassword }),
  setShowConfirmation: (showConfirmation) => set({ showConfirmation }),
  setCode: (code) => set({ code }),
  setIsAuthenticated: (status) => set({ isAuthenticated: status }),

  checkAuthAndExecute: async (callback) => {
    if (!get().isAuthenticated) {
      return;
    }

    try {
      await callback();
    } catch (error) {
      if (error.response?.status === 401 && !get().isLoggingOut) {
        try {
          await get().refreshToken();
          await callback();
          localStorage.setItem("user", JSON.stringify(get().user));
        } catch (refreshError) {
          await get().logout();
        }
      } else {
        throw error;
      }
    }
  },

  checkAuthStatus: () => {
    const loggedIn = Cookies.get("logged_in");
    get().setIsAuthenticated(!!loggedIn);
  },

  checkPasswordResetEmail: async (email) => {
    try {
      const response = await api.get(`/auth/reset-password/${email}`, {
        withCredentials: true,
      });
      if (response.data.status === "success") {
        toast.info("Пожалуйста, проверьте ваш email для востановления пароля.");
      }
    } catch (error) {
      toast.error(
        "Ошибка отправки запроса на сброс пароля: " +
          (error.response?.data?.message || error.message)
      );
      console.error("Error Registrations:", error);
    }
  },
  chengePasswordReset: async (queryToken, confirmPassword) => {
    try {
      const response = await api.post(
        `/auth/reset-password`,
        {},
        {
          params: {
            token: queryToken,
            pass: confirmPassword,
          },
        },
        {
          withCredentials: true,
        }
      );
      if (response.data.status === "success") {
        toast.info("Пороль успешно изменен");
      }
    } catch (error) {
      toast.error(
        "Ошибка отправки запроса на сброс пароля: " +
          (error.response?.data?.message || error.message)
      );
      console.error("Error Registrations:", error);
    }
  },

  registerFunc: async () => {
    const { email, fio, phone_number, password } = get();
    try {
      const response = await api.post(
        `/auth/register`,
        { email, fio, phone_number, password },
        { withCredentials: true }
      );
      if (response.data.status === "success") {
        set({ showConfirmation: true });
        toast.info("Пожалуйста, проверьте ваш email для подтверждения.");
      }
    } catch (error) {
      toast.error(
        "Ошибка регистрации: " +
          (error.response?.data?.message || error.message)
      );
      console.error("Error Registrations:", error);
    }
  },

  loginFunc: async (navigate) => {
    const { email, password } = get();
    try {
      const response = await api.post(
        `/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      if (response.data.status === "success") {
        get().checkAuthStatus();
        navigate("/profile");
        toast.success("Успешный вход!");
      }
    } catch (error) {
      toast.error(
        "Ошибка авторизации: " +
          (error.response?.data?.message || error.message)
      );
      console.error("Error Auth:", error);
    }
  },

  verifyFunc: async (navigate) => {
    const { email, code } = get();
    try {
      const response = await api.post(
        `/auth/verify-code`,
        { email, code },
        { withCredentials: true }
      );
      if (response.data.status === "success") {
        navigate("/auth");
        toast.success("Код подтвержден!");
      }
    } catch (error) {
      toast.error("Ошибка: не правильный код верификации " + error.message);
      console.error("Error Verify:", error);
    }
  },

  getUserInfo: async () => {
    await get().checkAuthAndExecute(async () => {
      try {
        const response = await api.get(`/user/me`);
        set({ user: response.data, isLoggedOut: false, isLoadingUser: false });
        localStorage.setItem("user", JSON.stringify(response.data));
      } catch (error) {
        console.error("Ошибка при получении данных:", error);
        set({ isLoadingUser: false });
        throw error;
      }
    });
  },

  refreshToken: async () => {
    if (get().isRefreshingToken || get().isLoggingOut) {
      return;
    }
    try {
      set({ isRefreshingToken: true });
      await api.post(`/auth/refresh`, {}, { withCredentials: true });
      set({ isRefreshingToken: false, isAuthenticated: true }); // Добавлено обновление статуса
    } catch (error) {
      set({ isRefreshingToken: false });
      if (error.response?.status === 401) {
        await get().logout();
      }
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ isLoggingOut: true });
      await api.post(`/auth/logout`, {}, { withCredentials: true });
      set({
        user: null,
        isLoggedOut: true,
        isLoggingOut: false,
        isAuthenticated: false,
      });
      localStorage.removeItem("user");
      window.location.href = "/";
    } catch (error) {
      set({ isLoggingOut: false });
      console.error("Ошибка при выходе:", error);
    }
  },

  fetchUsers: async () => {
    await get().checkAuthAndExecute(async () => {
      try {
        const response = await api.get(`/user`);
        set({ allUsers: response.data });
      } catch (error) {
        toast.error(error.message);
      }
    });
  },
}));

export default useUserStore;
