import { useState, useEffect } from "react";
import VehicleCard from "@/vehicle/VehicleCard.jsx";
import AddVehicle from "@/vehicle/VehicleForm.jsx";
import BookingList from "@/booking/BookingList.jsx";
import socket from "../Services/socket";
import API from "../Services/api"; 
import { useAuthContext } from "@/Context/authContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
    const { setUser, setToken } = useAuthContext();
    const navigate = useNavigate();
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [vehicle, setVehicle] = useState([]); 
    const [refresh, setRefresh] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Added to prevent white screen

    const reload = () => setRefresh(prev => !prev);

    // --- LOGOUT LOGIC ---
    const handleLogout = () => {
        socket.disconnect();
        localStorage.clear();
        setUser(null);
        setToken(null);
        navigate("/login", { replace: true });
    };

    // --- FETCH VEHICLE LIST ---
    useEffect(() => {
        const fetchFleet = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const res = await API.get("vehicle", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setVehicle(Array.isArray(res.data) ? res.data : res.data.vehicles || []);
            } catch (err) {
                console.error("Error fetching fleet:", err);
            }
        };
        fetchFleet();
    }, [refresh]);

    // --- AUTH & SOCKET LOGIC ---
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        
        if (!storedUser) {
            navigate("/login", { replace: true });
            return;
        }

        const user = JSON.parse(storedUser);
        setIsLoading(false); // Valid user found, show UI

        if (!socket.connected) socket.connect();
        socket.emit("joinAdmin");

        const handleNotification = (data) => {
            alert(`${data.title}: ${data.message}`);
            reload();
        };

        socket.on("notification", handleNotification);
        socket.on("vehicle:updated", reload);
        socket.on("connect_error", (err) => console.error("Admin Socket Error:", err.message));

        return () => {
            socket.off("notification", handleNotification);
            socket.off("vehicle:updated", reload);
            socket.off("connect_error");
        };
    }, [navigate]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
        try {
            const token = localStorage.getItem("token");
            await API.delete(`vehicles/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            reload();
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading Admin Panel...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                <Button onClick={handleLogout} variant="destructive">Logout</Button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Manage Vehicles</h2>
                <AddVehicle selectedVehicle={selectedVehicle} refresh={reload} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 pt-8 border-t">
                    {vehicle.length === 0 ? (
                        <p className="text-gray-500 col-span-full text-center">No vehicles found.</p>
                    ) : (
                        vehicle.map((v) => (
                            <VehicleCard 
                                key={v._id || v.id}
                                vehicle={v} 
                                onEdit={setSelectedVehicle}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Manage Bookings</h2>
                <BookingList key={refresh} />
            </div>
        </div>
    );
}
