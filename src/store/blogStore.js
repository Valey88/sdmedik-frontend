import { toast } from "react-toastify";
import api from "../configs/axiosConfig";
import { create } from "zustand";

const useBlogStore = create((set) => ({
  blog: [],
  post: {},
  loading: false,
  error: null,

  fetchBlog: async () => {
    try {
      const response = await api.get("/blog", { withCredentials: true });
      set({ blog: response.data });
    } catch (error) {
      console.error("Error fetching blog:", error);
    }
  },
  fetchBlogById: async (id) => {
    set({ loading: true, error: null, post: null }); // Сбрасываем post при начале загрузки
    try {
      const response = await api.get(`/blog/${id}`);
      set({ post: response.data, loading: false });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Не удалось загрузить пост";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },
  updatePost: async (id, postData) => {
    set({ loading: true, error: null });
    try {
      // 1. Отправляем PUT-запрос и ждем его завершения.
      await api.put(`/blog/${id}`, postData);

      // 2. УБИРАЕМ ВЫЗОВ fetchBlogById ОТСЮДА.
      // 3. Просто выключаем лоудер. Операция обновления успешно завершена.
      set({ loading: false });
    } catch (error) {
      // Этот блок сработает, только если сам PUT-запрос не удался.
      const errorMessage =
        error.response?.data?.message || "Failed to update post";
      set({ error: errorMessage, loading: false });

      // Пробрасываем ошибку для компонента.
      throw new Error(errorMessage);
    }
  },
  deletePost: async (id) => {
    try {
      const response = await api.delete(
        `/blog/${id}`,
        {},
        {
          withCredentials: true,
        }
      );

      toast.success("Пост успешно удален!");
    } catch (error) {
      console.error("Error delete post:", error);
      toast.error("Ошибка при удалении поста: " + error.message);
    }
  },
}));

export default useBlogStore;
