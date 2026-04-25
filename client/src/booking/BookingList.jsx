import { useState, useEffect, useCallback } from "react";
import API from "../Services/api";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BookingList() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState("");

    const fetchBookings = useCallback(async () => {
        try {
            const userData = localStorage.getItem("user");
            const token = localStorage.getItem("token"); // Get token for Auth

            if (!userData) {
                setLoading(false);
                return;
            }
            
            const user = JSON.parse(userData);
            const role = user.role || "";
            setUserRole(role);

            const url = role === "Admin" ? "bookings" : "bookings/me";
            
            // Pass token in headers to fix 403 Forbidden
            console.log("My Role is:", role);
            console.log("Requesting URL:", url);
            const res = await API.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = Array.isArray(res.data) ? res.data : res.data?.bookings || [];
            setBookings(data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleAcceptBooking = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await API.put(`bookings/accept/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchBookings();
        } catch (err) { console.error("Accept error:", err); }
    };

    const handleRejectBooking = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await API.put(`bookings/reject/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchBookings();
        } catch (err) { console.error("Reject error:", err); }
    };

    if (loading) return <p className="text-center p-4">Loading Bookings...</p>;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 p-4">
            {bookings.length === 0 ? (
                <p className="text-center col-span-2 text-gray-500">No bookings found.</p>
            ) : (
                bookings.map((booking) => (
                    <Card key={booking?._id || Math.random()} className="shadow-md rounded-2xl">
                        <CardHeader>
                            <CardTitle>{booking?.vehicleName || "Vehicle"}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p><strong>Customer:</strong> {booking?.customerName || "N/A"}</p>
                            <p>
                                <strong>Status:</strong>{" "}
                                <span className={
                                    booking?.status === "accepted" ? "text-green-600 font-bold" :
                                    booking?.status === "rejected" ? "text-red-600 font-bold" : "text-yellow-600 font-bold"
                                }>
                                    {booking?.status || "pending"}
                                </span>
                            </p>
                        </CardContent>

                        {booking?.status === "pending" && userRole === "Admin" && (
                            <CardFooter className="flex gap-2">
                                <Button onClick={() => handleAcceptBooking(booking?._id)}>
                                    Accept
                                </Button>
                                <Button variant="destructive" onClick={() => handleRejectBooking(booking?._id)}>
                                    Reject
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                ))
            )}
        </div>
    );
}
