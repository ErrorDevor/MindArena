import axios from "axios";

const api = axios.create({
   baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
   const token = process.env.NEXT_PUBLIC_API_TOKEN;
   if (token) {
      config.headers.Authorization = `Bearer ${token}`;
   }
   return config;
});

export default api;
