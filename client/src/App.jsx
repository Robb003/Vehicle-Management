import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/Login";
import Signup from "./Pages/SignUp";
import AdminDashboard from "./Pages/AdminDashboard";
import CustomerDashboard from "./Pages/CustomerDashboard";
import { useAuthContext } from "./Context/authContext";

export default function App() {
  const { user, loading } = useAuthContext();
  const role = user?.role;

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        {/* Root Path: Directs based on Login & Role */}
        <Route
          path="/"
          element={
            user ? (
              role === "Admin" ? <Navigate to="/admin" /> : <Navigate to="/customer" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Login: If user logs out, 'user' becomes null and this page shows */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <Login />}
        />

        {/* Signup: Accessible only if logged out */}
        <Route
          path="/signup"
          element={user ? <Navigate to="/" /> : <Signup />}
        />

        {/* Admin Protected Route */}
        <Route
          path="/admin"
          element={
            user && role === "Admin" ? <AdminDashboard /> : <Navigate to="/login" />
          }
        />

        {/* Customer Protected Route */}
        <Route
          path="/customer"
          element={
            user && role === "Customer" ? <CustomerDashboard /> : <Navigate to="/login" />
          }
        />

        {/* Catch-all: Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}
