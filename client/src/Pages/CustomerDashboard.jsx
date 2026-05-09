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
    const [isLoading, setIsLoading] = useState(true); // Prevents white screen flicker

    const reload = () => setRefresh(prev => !prev);

    const handleLogout = () => {
        socket.disconnect();
        localStorage.clear();
        setUser(null);
        setToken(null);
        navigate("/login", { replace: true });
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        
        if (!storedUser) {
            navigate("/login", { replace: true });
            return;
        }

        const user = JSON.parse(storedUser);
        setIsLoading(false); // User exists, show the UI

        // Only connect if not already connected
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

        // Listen for errors to prevent the "Throttling" loop
        socket.on("connect_error", (err) => {
            console.error("Socket Connection Error:", err.message);
        });

        socket.on("notification", handleNotification);
        socket.on("vehicle:updated", handleVehicleUpdate);

        return () => {
            socket.off("connect_error");
            socket.off("notification", handleNotification);
            socket.off("vehicle:updated", handleVehicleUpdate);
        };
    }, [navigate]);

    // Show a loading state instead of a white page while checking auth
    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
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
