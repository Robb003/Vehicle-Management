import axios from "axios";
import {io} from "socket.io-client";

const BackenedBaseUrl = "http://localhost:5000";
const APIBaseUrl = "http://localhost:5000/api";

const API =axios.create({
    baseURL: APIBaseUrl
});
export const signupUser = (name, phoneNumber,email, password, role, location)=>{
    return API.post("/auth/signup", {name, phoneNumber, email, password, role, location});
};

export const loginUser = (email, password)=>{
    return API.post("/auth/login", {email, password});
};

//vehicle
export const createVehicle = (name, registrationNumber, pricePerDay)=>{
    return API.post("/vehicle", {name, registrationNumber, pricePerDay});
};

export const getAllVehicles = ()=>{
    return API.get("/vehicles");
};

export const updateVehicle = (vehicleId, data)=>{
    return API.put(`/vehicle/${vehicleId}`, data);
};

export const deleteVehicle = (vehicleId) =>{
    return API.delete(`/vehicle/${vehicleId}`);
};

//booking

export const createBooking = (vehicle, startDate, endDate, bookingReason) =>{
    return API.post("/booking", {vehicle, startDate, endDate, bookingReason});
};

export const getAllBookings = ()=>{
    return API.get("/bookings");
};

export const getMyBookings =()=>{
    return API.get("/bookings/me");
}

export const acceptBooking = (bookingId) =>{
    return API.put(`/booking/accept/${bookingId}`);
};

export const rejectBooking =(bookingId) =>{
    return API.put(`/booking/reject/${bookingId}`);
};

export const socket = io(BackenedBaseUrl, {autoConnect: false});