import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Any request starting with /api is sent to our Node.js server.
    // So in React we can simply write api.get("/teachers").
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});
