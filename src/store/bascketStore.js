import { create } from "zustand";
import { toast } from "react-toastify";
import api from "../configs/axiosConfig";
const useBascketStore = create((set, get) => ({
  product: {
    article: "",
    category_ids: [],
    characteristic_values: [],
    description: "",
    name: "",
  },
  products: [],
  basket: {},
  addProductThisBascket: async (product_id, quantity, iso, dynamicOptions) => {
    try {
      const response = await api.post(
        `/basket`,
        { product_id, quantity, iso, dynamic_options: dynamicOptions },
        {
          withCredentials: true,
        }
      );
      // Обработка успешного ответа
      toast.success("Продукт добавлен в корзину");
      console.log("Продукт добавлен в корзину:", response.data);
    } catch (error) {
      toast.error("Ошибка при добавлении продукта в корзину:", error); // Обработка других ошибок
    }
  },
  editCountProductBascket: async (product_id, quantity, iso) => {
    try {
      const response = await api.post(
        `/basket`,
        { product_id, quantity, iso },
        {
          withCredentials: true,
        }
      );
      console.log("Продукт добавлен в корзину:", response.data);
    } catch (error) {
      // Обработка ошибки
      if (error.response.status === 401) {
        await get().addProductThisBascket(product_id, quantity); // Повторяем запрос
      } else {
        toast.error(
          "Ошибка при сохранении продукта: " +
            (error.response?.data?.message || error.message)
        );
      }
    }
  },
  fetchUserBasket: async () => {
    try {
      const response = await api.get(`/basket`, {
        withCredentials: true,
      });

      set({ basket: response.data });
    } catch (error) {
      console.error("Error fetching basket:", error);
    }
  },

  //   fetchProductsByIds: async (items) => {
  //     if (Array.isArray(items) && items.length > 0) {
  //       let products = [];
  //       for (let item of items) {
  //         try {
  //           const response = await api.get(
  //             "http://localhost:8080/api/v1/product",
  //             {
  //               params: { id: item.toString() },
  //             }
  //           );

  //           products.push(response.data);
  //         } catch (error) {
  //           console.error(`Error fetching product with ID ${item}:`, error);
  //         }
  //       }
  //       set({ products });
  //     } else {
  //       console.warn("Items is not an array or is empty.");
  //     }
  //   },
  deleteProductThithBasket: async (id) => {
    try {
      const response = await api.delete(`/basket/${id}`, {
        withCredentials: true,
      });
      toast.success("Продукт удален из корзины");
      if (error.response.status === 401) {
        // Если статус 401, обновляем токены и повторяем запрос
        await get().refreshToken();
        await get().deleteProductThithBasket(id); // Повторяем запрос
      } else {
        throw new Error("No data in response");
      }
    } catch (error) {
      console.error("Ошибка при удалении продукта:");
      // console.error("Error deleting basket:", error);
    }
  },

  refreshToken: async () => {
    try {
      const response = await api.post(
        `/auth/refresh`,
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

export default useBascketStore;
