import { create } from "zustand";
import axios from "axios";
import { url } from "../constants/constants";

const usePromotionStore = create((set, get) => ({
  createPromotion: async (payload) => {
    try {
      const response = await axios.post(`${url}/promotion`, payload, {
        withCredentials: true,
      });
      // Обработка успешного ответа
      console.log("Акция создана:", response.data);
    } catch (error) {
      // Обработка ошибки
      console.error("Ошибка при создании продукта:", error);
      if (error.response.status === 401) {
        // Если статус 401, обновляем токены и повторяем запрос
        // await get().refreshToken();
        // await get().createProduct(formData); // Повторяем запрос
      } else {
        alert(
          "Ошибка при сохранении акции: " +
            (error.response?.data?.message || error.message)
        );
      }
    }
  },

  deletePromotion: async (id) => {
    try {
      const response = await axios.delete(`${url}/promotion/${id}`);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  },

  promotions: [],
  fetchPromotion: async () => {
    try {
      const response = await axios.get(`${url}/promotion`);
      set({ promotions: response.data });
    } catch (error) {
      console.error("Error fetching product:", error);
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
}));

export default usePromotionStore;
