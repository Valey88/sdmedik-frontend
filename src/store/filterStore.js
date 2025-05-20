import { create } from "zustand";
import axios from "axios";
import { url } from "../constants/constants";

const useFilterStore = create((set, get) => ({
  // Existing state for storing fetched filters
  filters: [],

  // New state for handling checkbox changes
  selectedFilters: [],

  // Method to fetch filters based on category_id
  fetchFilter: async (category_id) => {
    try {
      const response = await axios.get(`${url}/product/filter/${category_id}`);
      set({ filters: response.data });
    } catch (error) {
      console.error("Error fetching filters:", error);
    }
  },

  // Method to update selected filters
  setSelectedFilters: (filter) => {
    set((state) => {
      const isFilterSelected = state.selectedFilters.includes(filter);
      if (isFilterSelected) {
        // If the filter is already selected, remove it
        return {
          selectedFilters: state.selectedFilters.filter((f) => f !== filter),
        };
      } else {
        // If the filter is not selected, add it
        return { selectedFilters: [...state.selectedFilters, filter] };
      }
    });
  },
}));

export default useFilterStore;
