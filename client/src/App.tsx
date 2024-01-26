import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "./redux/store"; // adjust import paths
import { checkAuthStatus, logout } from "./redux/authslice"; // adjust import paths
import { Login, Register, Home, Globalchat } from "./views";
import UserProfile from "./views/UserProfile";

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(checkAuthStatus());

    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === "login") {
        dispatch(checkAuthStatus()); // Re-check auth status if the login event is detected
      } else if (event.key === "logout") {
        dispatch(logout()); // Dispatch logout action if the logout event is detected
      }
    };

    window.addEventListener("storage", handleStorageEvent);

    return () => {
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, [dispatch]);

  useEffect(() => {
    // Store the login status in localStorage
    localStorage.setItem("isAuthenticated", String(isAuthenticated));
  }, [isAuthenticated]);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/home" /> : <Login />}
        />
        <Route
          path="/globalchat"
          element={isAuthenticated ? <Globalchat /> : <Navigate to="/login" />}
        />
        <Route path="/register" element={<Register />} />
        <Route
          path="/home"
          element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
        />
        <Route
          path="/user/:username"
          element={isAuthenticated ? <UserProfile /> : <Navigate to="/login" />}
        />

        <Route
          path="*"
          element={
            isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/login" />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
