import { create } from "zustand";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { url } from "../constants/constants";
import api from "../configs/axiosConfig";

const useOrderStore = create((set, get) => ({
  email: "",
  fio: "",
  phone_number: "",
  delivery_address: "",
  setEmail: (email) => set({ email }),
  setFio: (fio) => set({ fio }),
  setPhone_number: (phone_number) => set({ phone_number }),
  setDelivery_address: (delivery_address) => set({ delivery_address }),
  order: {},
  orders: {},
  userOrders: [],

  payOrder: async () => {
    const { email, fio, phone_number, delivery_address } =
      useOrderStore.getState();

    try {
      const response = await axios.post(
        `${url}/order`,
        {
          email,
          fio,
          phone_number,
          delivery_address,
        },
        {
          withCredentials: true,
        }
      );
      console.log("Response:", response);
      //   set({ order: response.data });
      // Исправлено: проверка статуса ответа
      if (response.data.status === "success") {
        window.location.href = response.data.data.url;
      }
    } catch (error) {
      toast.error(
        "Ошибка оплаты: " + (error.response?.data?.message || error.message)
      );
      console.error("Error Registrations:", error);
    }
  },
  payOrderById: async (id) => {
    const { email, fio, phone_number, delivery_address } =
      useOrderStore.getState();

    try {
      const response = await axios.post(
        `${url}/order/${id}`,
        {
          email,
          fio,
          phone_number,
          delivery_address,
        },
        {
          withCredentials: true,
        }
      );
      console.log("Response:", response);
      //   set({ order: response.data });
      // Исправлено: проверка статуса ответа
      if (response.data.status === "success") {
        window.location.href = response.data.data.url;
      }
    } catch (error) {
      toast.error(
        "Ошибка оплаты: " + (error.response?.data?.message || error.message)
      );
      console.error("Error Registrations:", error);
    }
  },
  changeStatus: async (order_id, status) => {
    try {
      const response = await axios.put(
        `${url}/order/status`,
        {
          order_id,
          status,
        },
        {
          withCredentials: true,
        }
      );
      console.log("Response:", response);
    } catch (error) {
      toast.error(
        "Ошибка оплаты: " + (error.response?.data?.message || error.message)
      );
      console.error("Error Registrations:", error);
    }
  },
  fetchOrders: async () => {
    try {
      const response = await api.get(`${url}/order`);
      set({ orders: response.data });
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  },
  fetchUserOrders: async () => {
    try {
      const response = await api.get(`${url}/order/my`);
      set({ userOrders: response.data });
    } catch (error) {
      console.error("Error fetching user orders:", error);
      throw error;
    }
  },
}));
export default useOrderStore;
