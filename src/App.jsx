import { useState } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MainLayout from "./layout/MainLayout";

export default function App() {

  const [mode, setMode] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("currentUser")
  );

  if (isLoggedIn) return <MainLayout />;

  return (
    <>
      {mode === "login" && (
        <Login
          setIsLoggedIn={setIsLoggedIn}
          goSignup={() => setMode("signup")}
        />
      )}

      {mode === "signup" && (
        <Signup
          goLogin={() => setMode("login")}
        />
      )}
    </>
  );
}
