import { useState } from "react";
import VehicleCard from "..VehicleForm/vehicle/VehicleCard";
import AddVehicle from "../vehicle/VehicleForm";
import BookingList from "../booking/BookingList";

export default function AdminDashboard() {
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [refresh, setRefresh] = useState(false);

    const reload = ()=> setRefresh(refresh);
    return(
        <div className="min-h-screen bg-gray-100-p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">
                Admin Dashboard
            </h1>
            <div className="bg-white p-6 rounded-2xl shadow mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">
                    Manage Vehicles
                </h2>
                <AddVehicle 
                    selectedVehicle={selectedVehicle}
                    refresh={reload}
                />
                <VehicleCard 
                    onEdit={setSelectedVehicle}
                    key={refresh}/>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow">
                <h2 className="text-xl font-semiboled mb-4 text-gray-700">
                    Manage Bookings
                </h2>
                <BookingList />
            </div>
        </div>
    );
}