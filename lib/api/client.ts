import axios from "axios";
import { FRAPPE_API_URL } from "@/lib/constants";

export const frappeClient = axios.create({
  baseURL: FRAPPE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

frappeClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Sessao expirada");
    }
    return Promise.reject(error);
  }
);