// Remembers who is logged in, so every page can use it with useAuth().
import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Start with the user saved in the browser (so a page refresh keeps you logged in).
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  // When the app opens, ask the server if the saved token is still valid.
  useEffect(() => {
    if (localStorage.getItem("token")) {
      api
        .get("/auth/me")
        .then((res) => saveUser(res.data))
        .catch(() => {}); // the axios helper already logs out on 401
    }
  }, []);

  function saveUser(data) {
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
  }

  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    saveUser(res.data.user);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
