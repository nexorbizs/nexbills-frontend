import axios from "axios";

/* ================= BASE URL ================= */

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000
});

/* ================= REQUEST ================= */

API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");

    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE ================= */

let isRedirecting = false;

API.interceptors.response.use(
  (res) => res,

  (error) => {

    /* ⭐ TOKEN EXPIRED */
    if (error.response?.status === 401 && !isRedirecting) {

      isRedirecting = true;

      localStorage.clear();

      window.location.href = "/";

      return Promise.reject(error);
    }

    /* ⭐ SERVER DOWN */
    if (!error.response) {
      console.log("Backend not reachable");
    }

    return Promise.reject(error);
  }
);

export default API;