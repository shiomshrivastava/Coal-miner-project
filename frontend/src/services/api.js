import axios from "axios";

const API_BASE_URL =
  window.location.protocol === "https:"
    ? "/api"
    : import.meta.env.VITE_API_URL;

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

export default API;