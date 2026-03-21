import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MainLayout from "./layout/MainLayout";
import Admin from "./pages/Admin";

export default function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login setIsLoggedIn={setIsLoggedIn} />}
        />

        <Route
          path="/signup"
          element={isLoggedIn ? <Navigate to="/dashboard" /> : <Signup goLogin={() => window.location.href = "/"} />}
        />

        {/* ⭐ ADMIN PANEL - No auth required, uses secret instead */}
        <Route
          path="/admin"
          element={<Admin />}
        />

        <Route
          path="/*"
          element={isLoggedIn ? <MainLayout setIsLoggedIn={setIsLoggedIn} /> : <Navigate to="/" />}
        />

      </Routes>
    </BrowserRouter>
  );
}