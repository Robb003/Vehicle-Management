import { useState, useEffect} from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardContent } from "@/components/ui/card";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import API from "../Services/api";
import socket from "../Services/socket";

export default function BookVehicle({onAdd}){
    const [vehicles, setVehicles] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [bookingReason, setBookingReason] = useState("");
    const [loading, setLoading] = useState(false);

    //fetch vehicles form backend
    useEffect(()=>{
        const fetchData = async()=>{
            try {
                const v = await API.get("/vehicles");
                const b = await API.get("/bookings");
                setVehicles(v.data);
                setBookings(b.data);
            } catch(err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);
    if (loading)return<p>Loading Vehicles...</p>

    //check if vehicle is booked
    const isBooked = (vehicleId)=> {
        return bookings.some(
            b => b.vehicleId === vehicleId && b.status !== "rejected"
        );
    };

    //creating a booking


    const handleSubmit=async(e)=>{
        e.preventDefault();

        const user =JSON.parse(localStorage.getItem("user"));
        if(!startDate || !endDate || !bookingReason){
            return alert("all fields required");
        } 
        if(!user){
            return alert("User not logged in");
        }
        setLoading(true);
        try {
            //send booking vie socket
            socket.emit("sendBooking", {
                customerId: user._id,
                vehicleId: selectedVehicle._id,
                startDate,
                endDate
            });

        onAdd([startDate, endDate, bookingReason]);
        setStartDate(null);
        setEndDate(null);
        setBookingReason("");
        alert("Booking succefully made");
        } catch(err){
            alert(err.response?.data?.message || "failed to add abooking");
        } finally {
            setLoading(false)
        };
    };

    return(
        <div className="space-y-6">

            //vehicle card
            {!selectedVehicle && (
                <div className="grid md:grid-cols-3 gap-6">
                    {vehicles.map(vehicle => {
                        const booked = isBooked(vehicle._id);

                        return (
                            <Card key={vehicle._id} className="p-4 shadow-md">

                                <CardHeader>
                                    <CardTitle>{vehicle.name}</CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-2">
                                    <p className="text-gray-500">{vehicle.type}</p>
                                    <p className="font-bold">
                                        KES {vehicle.price}
                                    </p>

                                    <p className={`font-bold ${
                                        booked ? "text-red-500" : "text-green-500"
                                    }`}>
                                        {booked ? "Booked" : "Available"}
                                    </p>

                                    <Button
                                        disabled={booked}
                                        onClick={() => setSelectedVehicle(vehicle)}
                                        className="w-full"
                                    >
                                        {booked ? "Unavailable" : "Book Now"}
                                    </Button>
                                </CardContent>

                            </Card>
                        );
                    })}
                </div>
            )}

            //booking form
            {selectedVehicle && (
                <Card className="w-[400px] mx-auto p-4 shadow-lg">

                    <CardHeader>
                        <CardTitle>
                            Book {selectedVehicle.name}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-3">

                        <label>Start Date</label>
                        <DatePicker
                            selected={startDate}
                            onChange={setStartDate}
                            className="w-full border p-2 rounded"
                        />

                        <label>End Date</label>
                        <DatePicker
                            selected={endDate}
                            onChange={setEndDate}
                            className="w-full border p-2 rounded"
                        />

                        <Input
                            value={bookingReason}
                            onChange={(e) => setBookingReason(e.target.value)}
                            placeholder="Booking reason"
                        />

                        <Button
                            onClick={handleSubmit}
                            className="w-full"
                        >
                            {loading ? "Booking..." : "Confirm Booking"}
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => setSelectedVehicle(null)}
                            className="w-full"
                        >
                            Back
                        </Button>

                    </CardContent>
                </Card>
            )}

        </div>
    );
}