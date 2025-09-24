import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001/api", // moved to 5001 to avoid conflicts
});

// attach JWT automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// typed helper wrappers using the configured axios instance
export const getPosts = () => api.get("/posts");
export const createPost = (post) => api.post("/posts", post);

export default api;
