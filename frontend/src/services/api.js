import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: false, // IMPORTANT
});

export default API;