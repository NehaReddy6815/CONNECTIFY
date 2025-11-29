import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;   // ✅ Use Render backend URL

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,   // 👉 Example: https://connectify-nb7d.onrender.com/api
});

// Automatically attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// API wrappers
export const getPosts = () => api.get("/posts");
export const createPost = (post) => api.post("/posts", post);

export default api;
