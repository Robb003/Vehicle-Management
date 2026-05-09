import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/Login";
import Signup from "./Pages/SignUp";
import AdminDashboard from "./Pages/AdminDashboard";
import CustomerDashboard from "./Pages/CustomerDashboard";
import { useAuthContext } from "./Context/authContext";

// The 'export default' must be exactly like this for the build to pass
export default function App() {
  const { user, loading } = useAuthContext();

  // 1. Normalize role to lowercase to prevent the "Ping-Pong" redirect loop
  const userRole = user?.role?.toLowerCase();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes: If logged in, go to root */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" replace />}
        />
        <Route
          path="/signup"
          element={!user ? <Signup /> : <Navigate to="/" replace />}
        />

        {/* Role-Based Protection: Case-insensitive checks prevent loops */}
        <Route
          path="/admin"
          element={
            userRole === "admin" ? <AdminDashboard /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/customer"
          element={
            userRole === "customer" ? <CustomerDashboard /> : <Navigate to="/login" replace />
          }
        />

        {/* Root Redirect Logic */}
        <Route
          path="/"
          element={
            user ? (
              userRole === "admin" ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/customer" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch-all: Always go back to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
