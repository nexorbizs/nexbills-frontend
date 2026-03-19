import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MainLayout from "./layout/MainLayout";

export default function App() {

  const isLoggedIn = !!localStorage.getItem("currentUser");

  return (
    <BrowserRouter>

      <Routes>

        {/* LOGIN */}
        <Route
          path="/"
          element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />}
        />

        {/* SIGNUP */}
        <Route
          path="/signup"
          element={isLoggedIn ? <Navigate to="/dashboard" /> : <Signup />}
        />

        {/* APP */}
        <Route
          path="/*"
          element={isLoggedIn ? <MainLayout /> : <Navigate to="/" />}
        />

      </Routes>

    </BrowserRouter>
  );
}