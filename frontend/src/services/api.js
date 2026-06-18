import axios from "axios";

const BASE = 'http://localhost:5000';

const API = axios.create({
  baseURL: BASE,
});

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("frms_user") || "{}");
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

// Also set default baseURL for all direct axios calls
axios.defaults.baseURL = BASE;
axios.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("frms_user") || "{}");
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

export const loginUser    = (data) => API.post("/api/auth/login", data);
export const registerUser = (data) => API.post("/api/auth/register", data);
export const getFishermen     = ()         => API.get("/api/fishermen");
export const createFisherman  = (data)     => API.post("/api/fishermen", data);
export const updateFisherman  = (id, data) => API.put(`/api/fishermen/${id}`, data);
export const getVessels    = ()         => API.get("/api/vessels");
export const createVessel  = (data)     => API.post("/api/vessels", data);
export const updateVessel  = (id, data) => API.put(`/api/vessels/${id}`, data);
export const getLicenses    = ()         => API.get("/api/licenses");
export const createLicense  = (data)     => API.post("/api/licenses", data);
export const updateLicense  = (id, data) => API.put(`/api/licenses/${id}`, data);
export const getCatchReports   = ()         => API.get("/api/catches");
export const createCatchReport = (data)     => API.post("/api/catches", data);
export const updateCatchReport = (id, data) => API.put(`/api/catches/${id}`, data);
export const getFishStock    = ()         => API.get("/api/stock");
export const createFishStock = (data)     => API.post("/api/stock", data);
export const updateFishStock = (id, data) => API.put(`/api/stock/${id}`, data);

export default API;