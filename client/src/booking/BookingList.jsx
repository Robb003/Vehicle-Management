import { useState, useEffect, useCallback } from "react";
import API from "../Services/api";
import socket from "../Services/socket"; // Import your socket instance
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
            if (!userData) return;
            
            const user = JSON.parse(userData);
            setUserRole(user.role || "");

            // Fetch based on role
            const url = user.role === "Admin" ? "/bookings" : "/bookings/me";
            const res = await API.get(url);

            const rawData = res.data;
            const extractedBookings = Array.isArray(rawData) 
                ? rawData 
                : (rawData?.bookings || rawData?.data || []);

            setBookings(extractedBookings);
        } catch (err) {
            console.error("Fetch error:", err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();

        // SOCKET LISTENER: Listen for updates from the Admin (if user is a Customer)
        // or from the Backend (if user is an Admin)
        socket.on("bookingUpdated", (updatedBooking) => {
            setBookings((prev) => 
                prev.map(b => b._id === updatedBooking._id ? updatedBooking : b)
            );
        });

        // Listen for brand new bookings (for Admins)
        socket.on("notification", () => {
            if (userRole === "Admin") fetchBookings();
        });

        return () => {
            socket.off("bookingUpdated");
            socket.off("notification");
        };
    }, [fetchBookings, userRole]);

    // HANDLE ACTION: Uses Sockets to ensure real-time notification
    const handleAction = (id, action) => {
        const eventName = action === 'accept' ? 'acceptBooking' : 'rejectBooking';
        
        // Use the Socket instead of a direct API PUT request
        // This triggers the backend logic we wrote that updates the DB AND notifies the customer
        socket.emit(eventName, { bookingId: id });
        
        // Optimistically update the UI status while the server processes
        setBookings(prev => prev.map(b => 
            b._id === id ? { ...b, status: action === 'accept' ? 'accepted' : 'rejected' } : b
        ));
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
                    <Card key={booking?._id} className="shadow-md rounded-2xl">
                        <CardHeader>
                            <CardTitle>{booking?.vehicle?.name || "Vehicle"}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p><strong>Customer:</strong> {booking?.customer?.name || "N/A"}</p>
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

                        {/* Admin Controls */}
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
