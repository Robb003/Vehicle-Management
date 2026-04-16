import {useState} from "react";
import BookVehicle from "../booking/BookVehicle";
import  BookingList from "../booking/BookingList";


export default function CustomerDashboard(){
    const [selectedVehicle, setSelectedVehicle] =useState(null);
    const [refresh, setRefresh] = useState(false);
    const reload =()=> setRefresh(prev=> !prev);

    return (
        <div className="min-h-screen bg-gray-100-p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Customer Dashboard</h1>

            <div className="bg-white p-6 rounded-2xl shadow mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Available Vehicles</h2>
                <BookVehicle
                    selectedVehicle={selectedVehicle}
                    setSelectedVehicle={setSelectedVehicle}
                    refresh={reload}
                />
                //booking form when a vehicle is selected
                {selectedVehicle && (
                    <div className="bg-white p-6 rounded-2xl shadow mb-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">
                            Book Vehicle
                        </h2>

                <BookVehicle
                    selectedVehicle={selectedVehicle}
                    setSelectedVehicle={setSelectedVehicle}
                    refresh={reload}
                />
                    </div>
                )}

                //my bookings
                <div className="bg-white p-6 rounded-2xl shadow">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">
                        My Bookings
                    </h2>
                    <BookingList key={refresh}
                </div>
            </div>
        </div>
    )
}