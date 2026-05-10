import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import API from "../Services/api";
import socket from "../Services/socket";

export default function BookVehicle({ onAdd }) {
    const [vehicles, setVehicles] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [bookingReason, setBookingReason] = useState("");
    const [loading, setLoading] = useState(true); 
    const [submitLoading, setSubmitLoading] = useState(false); 

    // Fetch vehicles and user's specific bookings
    const fetchData = async () => {
        try {
            // FIXED: Added leading slash for consistent API routing
            const v = await API.get("/vehicle");
            setVehicles(v.data);

            const b = await API.get("/bookings/me");
            setBookings(Array.isArray(b.data) ? b.data : b.data.bookings || []);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // SOCKET: Listen for global vehicle updates (e.g., when Admin accepts a booking)
        // This ensures the "Available" status changes to "Booked" instantly on this screen
        socket.on("vehicleUpdated", (updatedVehicle) => {
            setVehicles((prev) => 
                prev.map(v => v._id === updatedVehicle._id ? updatedVehicle : v)
            );
        });

        return () => socket.off("vehicleUpdated");
    }, []);

    // Check if THIS specific customer already sent a request
    const isBookedByMe = (vehicleId) => {
        return bookings.some(
            b => (b.vehicle?._id === vehicleId || b.vehicle === vehicleId) && b.status === "pending"
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem("user"));

        if (!startDate || !endDate || !bookingReason) {
            return alert("All fields are required");
        }
        if (!user) return alert("User not logged in");

        setSubmitLoading(true);
        try {
            // 1. Save to Database via REST API
            await API.post("/bookings", {
                vehicle: selectedVehicle._id,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                bookingReason: bookingReason
            });

            // 2. Notify Admin via Socket instantly
            socket.emit("sendBooking", {
                customerId: user.id || user._id,
                vehicleId: selectedVehicle._id,
                startDate,
                endDate,
                bookingReason
            });

            alert("Booking successfully made!");
            
            // 3. Reset form and refresh data
            setStartDate(null);
            setEndDate(null);
            setBookingReason("");
            setSelectedVehicle(null);
            
            fetchData(); // Local refresh
            if (onAdd) onAdd(); // Dashboard refresh
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add booking");
        } finally {
            setSubmitLoading(false);
        };
    };

    if (loading) return <p className="text-center p-10 text-gray-500">Loading Vehicles...</p>;

    return (
        <div className="space-y-6">
            {!selectedVehicle && (
                <div className="grid md:grid-cols-3 gap-6">
                    {vehicles.map(vehicle => {
                        const myRequestPending = isBookedByMe(vehicle._id);
                        // Check if the car is generally Booked (by anyone)
                        // Note: Using lowercase check to be safe
                        const isGloballyBooked = vehicle.status?.toLowerCase() === "booked";

                        return (
                            <Card key={vehicle._id} className="p-4 shadow-md border-t-4 border-t-blue-500">
                                <CardHeader>
                                    <CardTitle>{vehicle.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="text-gray-500">{vehicle.registrationNumber}</p>
                                    <p className="font-bold text-lg text-blue-600">
                                        KES {vehicle.pricePerDay} / day
                                    </p>
                                    
                                    {/* STATUS LOGIC */}
                                    <p className={`text-sm font-semibold ${
                                        isGloballyBooked ? "text-red-500" : 
                                        myRequestPending ? "text-orange-500" : "text-green-600"
                                    }`}>
                                        {isGloballyBooked ? "Currently Booked" : 
                                         myRequestPending ? "Pending Approval" : "Available"}
                                    </p>

                                    <Button
                                        disabled={isGloballyBooked || myRequestPending}
                                        onClick={() => setSelectedVehicle(vehicle)}
                                        className="w-full mt-4"
                                    >
                                        {isGloballyBooked ? "Not Available" : 
                                         myRequestPending ? "Request Sent" : "Book Now"}
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Selection Form remains the same */}
            {selectedVehicle && (
                <Card className="w-full max-w-md mx-auto p-4 shadow-lg border-2 border-blue-100">
                    <CardHeader>
                        <CardTitle className="text-center">Book {selectedVehicle.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col space-y-1">
                            <label className="text-sm font-medium">Start Date</label>
                            <DatePicker
                                selected={startDate}
                                onChange={setStartDate}
                                className="w-full border p-2 rounded outline-none"
                                minDate={new Date()}
                            />
                        </div>

                        <div className="flex flex-col space-y-1">
                            <label className="text-sm font-medium">End Date</label>
                            <DatePicker
                                selected={endDate}
                                onChange={setEndDate}
                                className="w-full border p-2 rounded outline-none"
                                minDate={startDate || new Date()}
                            />
                        </div>

                        <div className="flex flex-col space-y-1">
                            <label className="text-sm font-medium">Reason for Booking</label>
                            <Input
                                value={bookingReason}
                                onChange={(e) => setBookingReason(e.target.value)}
                                placeholder="e.g. Business trip"
                            />
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button variant="outline" onClick={() => setSelectedVehicle(null)} className="flex-1">
                                Back
                            </Button>
                            <Button onClick={handleSubmit} className="flex-1" disabled={submitLoading}>
                                {submitLoading ? "Booking..." : "Confirm Booking"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
