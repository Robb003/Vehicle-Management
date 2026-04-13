import { useState, useEffect } from "react";
import API from "../Services/api";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";



export default function BookingList(){
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    //fetch bookings

    const fetchBookings = async()=>{
        try {
            const user = JSON.parse(localStorage.getItem("user"));

            const url = 
                user.role ==="Admin"
                ? "/bookings"
                : "/bookings/me";
            
            const res = await API.get(url);
            setBookings(res.data);
        } catch(err) {
            console.error(err)
        } finally {
            setLoading(false);
        }
    }

        useEffect(()=> {
            fetchBookings();
        }, []);
         if (loading)return<p>Loading Bookings...</p>

         //accept a booking

         const handleAcceptBooking = async(id)=>{
            try {
                const res = await API.put(`/bookings/accept/${id}`);
                fetchBookings();
            } catch(err) {
                console.error(err);
            }
         };

         const handleRejectBooking = async(id)=>{
            try {
                const res =await API.put(`/bookings/reject/${id}`);
                fetchBookings();
            } catch(err) {
                console.error(err);
            }
         };

         return(
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 p-4">
                {bookings.map((booking)=> (
                    <Card key={booking._id} className="shadow-md rounded-2xl">
                        <CardHeader>
                            <CardTitle>{booking.vehicleName}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p><strong>Customer</strong> {booking.customerName}</p>
                            <p>
                                <strong>status:</strong>{" "}
                                <span className={
                                    booking.status ==="accepted"
                                    ? "text-green-600"
                                    : booking.status ==="rejected"
                                    ? "text-red-600"
                                    : "text-yellow-600"
                                }>
                                    {booking.status}
                                </span>
                            </p>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            {booking.status ==="pending" &&(
                                <>
                                    <Button onClick={()=>handleAcceptBooking(booking._id)}>
                                        Accept
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={()=>handleRejectBooking(booking._id)}
                                    >
                                        Reject
                                    </Button>
                                </>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>
         );
}