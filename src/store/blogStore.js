import { toast } from "react-toastify";
import api from "../configs/axiosConfig";
import { create } from "zustand";

const useBlogStore = create((set) => ({
  blog: [],
  post: {},

  fetchBlog: async () => {
    try {
      const response = await api.get("/blog", { withCredentials: true });
      set({ blog: response.data });
    } catch (error) {
      console.error("Error fetching blog:", error);
    }
  },
  fetchBlogById: async (id) => {
    try {
      const response = await api.get(`/blog/${id}`, {
        withCredentials: true,
      });
      set({ post: response.data });
    } catch (error) {
      console.error("Error fetching post:", error);
    }
  },
  updatePost: async (id, formData) => {
    try {
      const response = await api.put(`/blog/${id}`, formData, {
        withCredentials: true,
      });
      set({ post: response.data });
      toast.success("Пост успешно обновлен!");
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Ошибка при обновлении поста: " + error.message);
    }
  },
}));

export default useBlogStore;
