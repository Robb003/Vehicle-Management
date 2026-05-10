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
    // Context and Navigation hooks
    const { setUser, setToken } = useAuthContext();
    const navigate = useNavigate();

    // Local State Management
    const [selectedVehicle, setSelectedVehicle] = useState(null); // Holds vehicle data for editing
    const [vehicles, setVehicles] = useState([]);               // List of vehicles to display
    const [refresh, setRefresh] = useState(false);               // Toggle to trigger data re-fetch
    const [isLoading, setIsLoading] = useState(true);            // Loading state for initial load

    // Helper to trigger the fetchFleet useEffect
    const reload = () => setRefresh(prev => !prev);

    /**
     * Clears user session, disconnects sockets, and redirects to login
     */
    const handleLogout = () => {
        socket.disconnect();
        localStorage.clear();
        setUser(null);
        setToken(null);
        navigate("/login", { replace: true });
    };

    /**
     * Effect: Fetches the initial list of vehicles from the database.
     * Runs on mount and whenever 'refresh' state changes.
     */
    useEffect(() => {
        const fetchFleet = async () => {
            try {
                const res = await API.get("/vehicle"); 
                // Flexible data assignment to handle different backend response structures
                const data = Array.isArray(res.data) ? res.data : (res.data.data || res.data.vehicles || []);
                setVehicles(data);
            } catch (err) {
                console.error("Error fetching fleet:", err);
                setVehicles([]); 
            } finally {
                setIsLoading(false);
            }
        };
        fetchFleet();
    }, [refresh]);

    /**
     * Effect: Manages Real-time Socket.io connections and event listeners.
     * Updates the UI instantly when other users or the backend make changes.
     */
    useEffect(() => {
        // Ensure socket is active
        if (!socket.connected) {
            socket.connect();
        }
        
        // Join the dedicated admin room for specific notifications
        socket.emit("joinAdmin");

        // Handle alerts for new customer bookings
        const handleNotification = (data) => {
            alert(`${data.title}: ${data.message}`);
            reload(); // Refresh bookings list
        };

        // --- INSTANT UI UPDATES (State Management via Sockets) ---
        
        // Adds newly created vehicle to the grid without a page refresh
        const handleVehicleAdded = (newVehicle) => {
            setVehicles((prev) => [...prev, newVehicle]);
        };

        // Replaces the old vehicle data with updated details in the list
        const handleVehicleUpdated = (updatedVehicle) => {
            setVehicles((prev) => prev.map(v => v._id === updatedVehicle._id ? updatedVehicle : v));
            setSelectedVehicle(null); // Reset the edit form
        };

        // Removes a vehicle from the grid immediately after it's deleted from the DB
        const handleVehicleDeleted = (deletedId) => {
            setVehicles((prev) => prev.filter(v => v._id !== deletedId));
        };

        // Initialize Listeners
        socket.on("notification", handleNotification);
        socket.on("vehicleAdded", handleVehicleAdded);
        socket.on("vehicleUpdated", handleVehicleUpdated);
        socket.on("vehicleDeleted", handleVehicleDeleted);
        
        socket.on("connect_error", (err) => {
            console.error("Admin Socket Error:", err.message);
        });

        // Cleanup listeners on component unmount to prevent memory leaks
        return () => {
            socket.off("notification", handleNotification);
            socket.off("vehicleAdded", handleVehicleAdded);
            socket.off("vehicleUpdated", handleVehicleUpdated);
            socket.off("vehicleDeleted", handleVehicleDeleted);
            socket.off("connect_error");
        };
    }, []);

    /**
     * Deletes a vehicle via the API. 
     * Note: The UI update is handled by the 'vehicleDeleted' socket listener.
     */
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
        try {
            await API.delete(`/vehicle/${id}`);
        } catch (err) {
            console.error("Delete error:", err);
            alert(err.response?.data?.message || "Delete failed");
        }
    };

    // Full-screen loader for initial authentication/data check
    if (isLoading) {
        return (
            <div className="flex h-screen flex-col items-center justify-center space-y-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                <p className="font-medium text-gray-600">Verifying Admin Access...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                <Button onClick={handleLogout} variant="destructive">Logout</Button>
            </div>

            {/* Vehicle Management Section */}
            <div className="bg-white p-6 rounded-2xl shadow mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Manage Vehicles</h2>
                
                {/* Form for adding/editing vehicles */}
                <AddVehicle 
                    selectedVehicle={selectedVehicle} 
                    refresh={reload} 
                    setSelectedVehicle={setSelectedVehicle} 
                />
                
                {/* Responsive Fleet Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 pt-8 border-t">
                    {vehicles.length === 0 ? (
                        <p className="text-gray-500 col-span-full text-center py-10 italic">
                            No vehicles found in the database.
                        </p>
                    ) : (
                        vehicles.map((v) => (
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

            {/* Bookings Section */}
            <div className="bg-white p-6 rounded-2xl shadow">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Manage Bookings</h2>
                <BookingList key={refresh} />
            </div>
        </div>
    );
}
