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
            setLoading(true);
            const userData = localStorage.getItem("user");
            const token = localStorage.getItem("token");

            if (!userData || !token) {
                setLoading(false);
                return;
            }
            
            const user = JSON.parse(userData);
            setUserRole(user.role || "");

            const url = user.role === "Admin" ? "/bookings" : "/bookings/me";
            
            const res = await API.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const rawData = res.data;
            const extractedBookings = Array.isArray(rawData) 
                ? rawData 
                : (rawData?.bookings || rawData?.data || []);

            setBookings(extractedBookings);
        } catch (err) {
            console.error("Fetch error details:", err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleAction = async (id, action) => {
        try {
            const token = localStorage.getItem("token");
            await API.put(`/bookings/${action}/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchBookings(); 
        } catch (err) {
            console.error(`${action} error:`, err.response?.data || err.message);
        }
    };

    if (loading) return <p className="text-center p-4">Loading Bookings...</p>;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 p-4">
            {bookings.length === 0 ? (
                <div className="text-center col-span-2 py-10">
                    <p className="text-gray-500 text-lg">No bookings found.</p>
                    <Button variant="outline" className="mt-2" onClick={fetchBookings}>Retry</Button>
                </div>
            ) : (
                bookings.map((booking) => (
                    <Card key={booking?._id || Math.random()} className="shadow-md rounded-2xl">
                        <CardHeader>
                            {/* Updated to check populated vehicle object */}
                            <CardTitle>{booking?.vehicle?.name || "Vehicle"}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {/* FIX: Changed from booking.user to booking.customer */}
                            <p><strong>Customer:</strong> {booking?.customer?.name || "N/A"}</p>
                            
                            {/* Added display for the required Reason field */}
                            <p><strong>Reason:</strong> {booking?.bookingReason || "N/A"}</p>
                            
                            <p>
                                <strong>Status:</strong>{" "}
                                <span className={
                                    booking?.status === "accepted" ? "text-green-600 font-bold" :
                                    booking?.status === "rejected" ? "text-red-600 font-bold" : "text-yellow-600 font-bold"
                                }>
                                    {(booking?.status || "pending").toUpperCase()}
                                </span>
                            </p>
                        </CardContent>

                        {userRole === "Admin" && booking?.status === "pending" && (
                            <CardFooter className="flex gap-2">
                                <Button className="flex-1" onClick={() => handleAction(booking?._id, 'accept')}>
                                    Accept
                                </Button>
                                <Button className="flex-1" variant="destructive" onClick={() => handleAction(booking?._id, 'reject')}>
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
