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
    set({ loading: true, error: null }); // <-- 3. Включаем лоудер
    try {
      await api.put(`/blog/${id}`, postData);
      // После успешного обновления, мы перезапрашиваем данные,
      // чтобы получить самую свежую версию с сервера.
      // Это самый надежный паттерн.
      await get().fetchBlogById(id); // <-- 4. Перезапрашиваем данные, fetchBlogById сам выключит лоудер
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update post";
      set({ error: errorMessage, loading: false }); // <-- 5. Выключаем лоудер в случае ошибки
      // Пробрасываем ошибку, чтобы компонент мог ее поймать, если нужно
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
