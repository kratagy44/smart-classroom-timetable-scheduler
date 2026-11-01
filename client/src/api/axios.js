// One shared axios object for talking to the backend.
import axios from "axios";

const api = axios.create({ baseURL: "/api" });

// Before every request: attach the login token (if we have one).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// After every response: if the server says "401 not logged in", go back to the login page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config && error.config.url === "/auth/login";
    if (error.response && error.response.status === 401 && !isLoginRequest) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Gets a readable error message from a failed request.
export function errorMessage(error) {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  return "Cannot reach the server. Is the backend running?";
}

export default api;
