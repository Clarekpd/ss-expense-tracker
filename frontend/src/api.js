import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  signup: (username, password) => api.post("/signup", { username, password }),
  login: (username, password) => api.post("/login", { username, password }),
  getUser: () => api.get("/user"),
};

export const expenseAPI = {
  getExpenses: () => api.get("/expenses"),
  addExpense: (amount, category, date, notes) =>
    api.post("/expenses", { amount, category, date, notes }),
  updateExpense: (id, data) => api.put(`/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/expenses/${id}`),
};

export const reportAPI = {
  getSummary: () => api.get("/reports/summary"),
  getMonthly: (year) => api.get(`/reports/monthly?year=${year}`),
  getDaily: () => api.get("/reports/daily"),
};
