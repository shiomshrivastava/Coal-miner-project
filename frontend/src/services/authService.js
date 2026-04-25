import API from "./api";

export const loginUser = (data) => API.post("/login", data);