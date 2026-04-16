import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import Login from "./Pages/Login";
import Signup from "./Pages/SignUp";
import AdminDashboard from "./Pages/AdminDashboard";
import CustomerDashboard from "./Pages/CustomerDashboard";

export default function App(){
  return(
    <BrowserRouter>
      <Routes>
          <Route path="/"
                 element={
                  user ? (
                    user.role ==="Admin" ?(
                      <Navigate to="/admin" />
                    ) : (
                      <Navigate to ="/customer" />
                    )
                  ) :(
                    <Login />
                  )
                 }           
          />

          <Route
              path="/signup"
              element={user ? <Navigate to="/" /> : <SignUp />}
          />
        {/*admin protectedRoute*/}
          <Route
              path="/admin"
              element={
                user?.role ==="Admin"
                ?<AdminDashboard />
                :<Navigate to="/" />
              }
          />

          {/*customer protectedRoute*/}

          <Route
              path="/customer"
              element ={
                user?.role ==="Customer"
                ?<CustomerDashboard />
                :<Navigate to="/" />
              }
          />

      </Routes> 
    </BrowserRouter>
  )
}