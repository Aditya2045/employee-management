import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" }
});

export const getEmployees = () => api.get("/employees");
export const createEmployee = (employee) => api.post("/employees", employee);
export const updateEmployee = (id, employee) => api.put(`/employees/${id}`, employee);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);
