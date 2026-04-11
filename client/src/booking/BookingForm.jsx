import { useState, useEffect} from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardContent } from "@/components/ui/card";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import API from "../Services/api";

export default function BookVehicle({onAdd}){
    const [vehicles, setVehicles] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState("");
    const [bookingReason, setBookingReason] = useState("");
    const [loading, setLoading] = useState(false);

    //fetch vehicles form backend
    useEffect(()=>{
        fetch('http://localhost:5000/api/vehicles')
        .then(res=>res.json())
        .then(data=>{
            setVehicles(data);
            setLoading(false);
        })
        .catch(error => console.error(error));
    }, []);
    if (loading)return<p>Loading Vehicles...</p>

    //creating a booking


    const handleSubmit=async(e)=>{
        e.preventDefault();
        if(!startDate || !endDate || !bookingReason){
            return alert("all fields required");
        } 
        setLoading(true);
        try {
            const res = await API.post("/booking", {vehicleId: selectedVehicle, startDate: startDate.toString(), endDate: endDate.toString(), bookingReason}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
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

    return (
        <div className="flex justify-center mt-6">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>Book A Vehicle</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-3">
                        <label className="text-sm font-medium">Selct Vehicle</label>
                        <select
                            value={selectedVehicle}
                            onChange={(e)=>setSelectedVehicle(e.target.value)}
                            className="w-full border p-2 rounded"
                            required
                        >
                            <option value="">--choose a vehicle--</option>
                            {vehicles.map(v=>(
                                <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                        </select>
                        <label>Start Date</label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date)=>setStartDate(date)}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            placeholderText="Select start date"
                            className="w-full border p-2 rounded"
                            required
                        />
                        <label>End Date</label>
                        <DatePicker
                            selected={endDate}
                            onChange={(date)=>setEndDate(date)}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            placeholderText="Select end date"
                            className="w-full border p-2 rounded"
                            required
                        />
                        <Input
                            type="text"
                            value={bookingReason}
                            onChange={(e)=>setBookingReason(e.target.value)}
                            placeholderText="Enter booking reason"
                            required
                        />
                        <Button type="submit" className="w-full">
                             {loading ? "Booking..." : "Book Vehicle"}
                        </Button>
                    </CardContent>
                </form>
            </Card>
        </div>
    )
}