// 1. Use a helper to check roles safely
const userRole = user?.role?.toLowerCase();

// 2. Update your Routes
<Routes>
  <Route
    path="/login"
    element={!user ? <Login /> : <Navigate to="/" replace />}
  />
  
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

  <Route
    path="/"
    element={
      user ? (
        userRole === "admin" ? <Navigate to="/admin" replace /> : <Navigate to="/customer" replace />
      ) : (
        <Navigate to="/login" replace />
      )
    }
  />
</Routes>
