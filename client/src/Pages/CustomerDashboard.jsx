import { useState, useEffect } from "react";
import BookVehicle from "@/booking/BookingForm.jsx";
import BookingList from "@/booking/BookingList.jsx";
import socket from "../Services/socket.js";
import { useAuthContext } from "@/Context/authContext";
import { Button } from "@/components/ui/button"; 
import { useNavigate } from "react-router-dom"; 

export default function CustomerDashboard() {
    const { setUser, setToken } = useAuthContext();
    const navigate = useNavigate();
    const [refresh, setRefresh] = useState(false);
    const [isLoading, setIsLoading] = useState(true); 

    // Function to trigger a re-fetch of data in child components
    const reload = () => setRefresh(prev => !prev);

    // Cleans up everything when the user leaves
    const handleLogout = () => {
        socket.disconnect();
        localStorage.clear();
        setUser(null);
        setToken(null);
        navigate("/login", { replace: true });
    };

    useEffect(() => {
        // 1. Security Check: Make sure the user is actually logged in
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            navigate("/login", { replace: true });
            return;
        }

        const user = JSON.parse(storedUser);
        setIsLoading(false); 

        // 2. Socket Setup: Connect to the server
        if (!socket.connected) {
            socket.connect();
        }

        // Tell the server this specific customer is online
        socket.emit("joincustomer", user.id || user._id);

        // This runs when the Admin approves or rejects YOUR booking
        const handleNotification = (data) => {
            alert(data.message || "You have a new update!");
            reload(); // Refresh the "My Bookings" list
        };

        // This runs when ANY vehicle is booked by ANYONE (Live Status Sync)
        const handleVehicleUpdate = (vehicle) => {
            console.log("A vehicle status changed globally:", vehicle);
            reload(); // Refresh the "Available Vehicles" list
        };

        // Error handling for Render.com connection timeouts
        socket.on("connect_error", (err) => {
            console.error("Socket Error:", err.message);
        });

        // Listen for messages from the backend
        socket.on("notification", handleNotification);
        
        // FIXED: Changed from 'vehicle:updated' to 'vehicleUpdated' to match backend
        socket.on("vehicleUpdated", handleVehicleUpdate);

        // 3. Cleanup: Stop listening when the user leaves the page
        return () => {
            socket.off("connect_error");
            socket.off("notification", handleNotification);
            socket.off("vehicleUpdated", handleVehicleUpdate); 
        };
    }, [navigate]);

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading Dashboard...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {/* Header with Logout */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Customer Dashboard</h1>
                <Button onClick={handleLogout} variant="destructive">
                    Logout
                </Button>
            </div>

            {/* Fleet Section - Shows cars and booking form */}
            <div className="bg-white p-6 rounded-2xl shadow mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Available Vehicles</h2>
                {/* key={refresh} ensures the form/list resets when a vehicle is booked */}
                <BookVehicle key={`fleet-${refresh}`} onAdd={reload} />
            </div>

            {/* My Bookings Section - Shows history and status */}
            <div className="bg-white p-6 rounded-2xl shadow">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">My Bookings</h2>
                <BookingList key={`bookings-${refresh}`} />
            </div>
        </div>
    );
}
