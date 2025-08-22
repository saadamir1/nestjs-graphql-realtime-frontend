import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";

import NotificationCenter from "./components/notifications/NotificationCenter";
import ChatDashboard from "./components/chat/ChatDashboard";
import VerifyEmail from "./pages/VerifyEmail";

const AppRoutes = () => {
  const isLoggedIn = !!localStorage.getItem("access_token");

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={isLoggedIn ? <DashboardLayout /> : <Navigate to="/login" />}
        >
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="notifications" element={<NotificationCenter />} />
          <Route path="chat" element={<ChatDashboard />} />
        </Route>
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route
          path="*"
          element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
