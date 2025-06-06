import { create } from "zustand";
import axios from "axios";
import { url } from "../constants/constants";

const useCategoryStore = create((set, get) => ({
  category: [],
  categoryId: {},
  fetchCategory: async () => {
    try {
      const response = await axios.get(`${url}/category`);
      set({ category: response.data });
    } catch (error) {
      console.error("Error fetching category:", error);
    }
  },
  fetchCategoryId: async (id) => {
    try {
      const response = await axios.get(`${url}/category/${id}`);
      set({ categoryId: response.data });
    } catch (error) {
      console.error("Error fetching category:", error);
    }
  },

  refreshToken: async () => {
    try {
      const response = await axios.post(
        `${url}/auth/refresh`,
        {},
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error("Error:", error);
    }
  },

  createCategory: async (formData) => {
    try {
      const response = await axios.post(`${url}/category`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data.status === "success") {
        alert("Категория успешно сохранена!");
        get().fetchCategory();
      } else {
        alert("Ошибка: " + response.data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.response?.status === 401) {
        await get().refreshToken();
        await get().createCategory(formData);
      } else {
        alert(
          "Ошибка при сохранении категории: " +
            (error.response?.data?.message || error.message)
        );
      }
    }
  },

  updateCategory: async (id, categoryData) => {
    try {
      const response = await axios.put(`${url}/category/${id}`, categoryData, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.status === "success") {
        alert("Категория успешно обновлена!");
        get().fetchCategory();
      } else {
        alert("Ошибка: " + response.data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.response?.status === 401) {
        await get().refreshToken();
        await get().updateCategory(id, formData);
      } else {
        alert(
          "Ошибка при обновлении категории: " +
            (error.response?.data?.message || error.message)
        );
      }
    }
  },

  deleteCategory: async (id) => {
    try {
      const response = await axios.delete(`${url}/category/${id}`);
      get().fetchCategory();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  },
}));

export default useCategoryStore;
