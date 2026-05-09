import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/Login";
import Signup from "./Pages/SignUp";
import AdminDashboard from "./Pages/AdminDashboard";
import CustomerDashboard from "./Pages/CustomerDashboard";
import { useAuthContext } from "./Context/authContext";

export default function App() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" replace />}
        />
        <Route
          path="/signup"
          element={!user ? <Signup /> : <Navigate to="/" replace />}
        />

        {/* Role-Based Protection */}
        <Route
          path="/admin"
          element={
            user?.role === "Admin" ? <AdminDashboard /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/customer"
          element={
            user?.role === "Customer" ? <CustomerDashboard /> : <Navigate to="/login" replace />
          }
        />

        {/* Root Redirect Logic */}
        <Route
          path="/"
          element={
            user ? (
              user.role === "Admin" ? <Navigate to="/admin" replace /> : <Navigate to="/customer" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
