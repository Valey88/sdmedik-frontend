import { create } from "zustand";
import axios from "axios";
import { url } from "../constants/constants";

const useSearchStore = create((set, get) => ({
  searchQuery: "",
  searchSuggestions: [],
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchSuggestions: (suggestions) =>
    set({ searchSuggestions: suggestions }),
  searchProducts: async (query) => {
    try {
      const response = await axios.get(`${url}/search`, {
        params: { query },
      });
      return response.data.data; // Предполагаем, что данные возвращаются в формате { data: [...] }
    } catch (error) {
      console.error("Ошибка при поиске товаров:", error);
      return []; // Возвращаем пустой массив в случае ошибки
    }
  },
}));

export default useSearchStore;
