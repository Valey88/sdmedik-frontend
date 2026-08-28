import { create } from "zustand";
import api from "../configs/axiosConfig";
import { toast } from "react-toastify";

const useReviewStore = create((set, get) => ({
  reviews: [],
  total: 0,
  stats: null,
  page: 1,
  limit: 10,
  loading: false,
  error: null,

  adminReviews: [],
  adminTotal: 0,
  adminStats: null,
  adminLoading: false,

  fetchReviews: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);
      if (params.rating) queryParams.append("rating", params.rating);
      if (params.with_photos) queryParams.append("with_photos", "true");
      if (params.source) queryParams.append("source", params.source);
      if (params.sort_by) queryParams.append("sort_by", params.sort_by);

      const response = await api.get(`/review?${queryParams.toString()}`);
      const data = response.data?.data;

      set({
        reviews: data?.reviews || [],
        total: data?.total || 0,
        stats: data?.stats || null,
        page: data?.page || 1,
        limit: data?.limit || 10,
        loading: false,
      });
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || "Ошибка при загрузке отзывов";
      set({ error: msg, loading: false });
      console.error("fetchReviews error:", error);
    }
  },

  createReview: async (reviewData) => {
    try {
      const response = await api.post("/review", reviewData);
      toast.success("Спасибо за ваш отзыв! Он появится на сайте после модерации.");
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || "Ошибка при отправке отзыва";
      toast.error(typeof msg === "string" ? msg : "Не удалось отправить отзыв");
      throw error;
    }
  },

  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post("/review/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data?.data;
    } catch (error) {
      toast.error("Ошибка при загрузке изображения");
      throw error;
    }
  },

  fetchAdminReviews: async (params = {}) => {
    set({ adminLoading: true });
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);
      if (params.status && params.status !== "all") queryParams.append("status", params.status);
      if (params.source && params.source !== "all") queryParams.append("source", params.source);
      if (params.search) queryParams.append("search", params.search);
      if (params.sort_by) queryParams.append("sort_by", params.sort_by);

      const response = await api.get(`/review/admin?${queryParams.toString()}`);
      const data = response.data?.data;

      set({
        adminReviews: data?.reviews || [],
        adminTotal: data?.total || 0,
        adminStats: data?.stats || null,
        adminLoading: false,
      });
      return data;
    } catch (error) {
      console.error("fetchAdminReviews error:", error);
      set({ adminLoading: false });
    }
  },

  adminCreateReview: async (reviewData) => {
    try {
      const response = await api.post("/review/admin", reviewData);
      toast.success("Отзыв успешно опубликован!");
      get().fetchAdminReviews();
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Ошибка при создании отзыва";
      toast.error(msg);
      throw error;
    }
  },

  adminUpdateStatus: async (id, status) => {
    try {
      await api.put(`/review/admin/${id}/status`, { status });
      const statusNames = {
        approved: "одобрен",
        rejected: "отклонен",
        pending: "отправлен на модерацию",
      };
      toast.success(`Отзыв ${statusNames[status] || status}`);
      // Обновляем статус локально
      set((state) => ({
        adminReviews: state.adminReviews.map((r) =>
          r.id === id ? { ...r, status } : r
        ),
      }));
    } catch (error) {
      toast.error("Ошибка при изменении статуса отзыва");
      throw error;
    }
  },

  adminUpdateReview: async (id, reviewData) => {
    try {
      await api.put(`/review/admin/${id}`, reviewData);
      toast.success("Отзыв успешно обновлен!");
      get().fetchAdminReviews();
    } catch (error) {
      toast.error("Ошибка при обновлении отзыва");
      throw error;
    }
  },

  adminDeleteReview: async (id) => {
    try {
      await api.delete(`/review/admin/${id}`);
      toast.success("Отзыв успешно удален!");
      set((state) => ({
        adminReviews: state.adminReviews.filter((r) => r.id !== id),
        adminTotal: state.adminTotal - 1,
      }));
    } catch (error) {
      toast.error("Ошибка при удалении отзыва");
      throw error;
    }
  },
}));

export default useReviewStore;
