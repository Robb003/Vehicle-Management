import { useState, useEffect } from "react";
import BookVehicle from "@/Booking/BookingForm.jsx";
import BookingList from "@/Booking/BookingList.jsx";
import socket from "@/Services/socket.js";
import { useAuthContext } from "@/Context/authContext";
import { Button } from "@/components/ui/button"; // Ensure you import your Button
import { useNavigate } from "react-router-dom"; // Import navigate

export default function CustomerDashboard() {
    const { setUser, setToken } = useAuthContext();
    const navigate = useNavigate(); // Initialize navigate
    const [refresh, setRefresh] = useState(false);
    const reload = () => setRefresh(prev => !prev);

    // --- LOGOUT LOGIC ---
    const handleLogout = () => {
        localStorage.clear(); // Clear storage
        setUser(null);        // Clear React state (Triggers App.jsx redirect)
        setToken(null);       // Clear Token state
        socket.disconnect();  // Close socket connection
        navigate("/login");   // Move to login page
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;

        const user = JSON.parse(storedUser);

        if (!socket.connected) {
            socket.connect();
        }

        socket.emit("joincustomer", user.id || user._id);

        const handleNotification = (data) => {
            console.log("Notification received:", data);
            alert(data.message || data.title);
            reload();
        };

        const handleVehicleUpdate = (vehicle) => {
            console.log("Vehicle updated:", vehicle);
            reload();
        };

        socket.on("notification", handleNotification);
        socket.on("vehicle:updated", handleVehicleUpdate);

        return () => {
            socket.off("notification", handleNotification);
            socket.off("vehicle:updated", handleVehicleUpdate);
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {/* --- TOP BAR WITH LOGOUT BUTTON --- */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Customer Dashboard</h1>
                <Button onClick={handleLogout} variant="destructive">
                    Logout
                </Button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Available Vehicles</h2>
                <BookVehicle onAdd={reload} />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">My Bookings</h2>
                <BookingList key={refresh} />
            </div>
        </div>
    );
}
