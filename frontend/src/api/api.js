import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // backend port, NOT 5173
});

// attach JWT automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


export const getPosts = () => API.get("/posts");
export const createPost = (post) => API.post("/posts",post);


export default api;
