import {useState} from "react";
import BookVehicle from "../booking/BookVehicle";
import  BookingList from "../booking/BookingList";
import BookingCard from "../booking/BookingCard";
import VehicleCard from "../vehicle/VehicleCard";


export default function CustomerDashboard(){
    const [selectedVehicle, setSelectedVehicle] =useState(null);
    const [refresh, setRefresh] = useState(false);
    const reload =()=> setRefresh(prev=> !prev);

    return (
        <div>
    )
}