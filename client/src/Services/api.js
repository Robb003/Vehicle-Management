import axios from "axios";
import {io} from "socket.io-client";

const BackenedBaseUrl = "https://vehicle-management-nunj.onrender.com";
const APIBaseUrl = "https://vehicle-management-nunj.onrender.com/api/";

const API =axios.create({
    baseURL: APIBaseUrl
});

// Add this right after const API = axios.create(...)
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
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
    return API.get("/vehicle");
};

export const updateVehicle = (vehicleId, data)=>{
    return API.put(`/vehicle/${vehicleId}`, data);
};

export const deleteVehicle = (vehicleId) =>{
    return API.delete(`/vehicle/${vehicleId}`);
};

//booking

export const createBooking = (vehicle, startDate, endDate, bookingReason) =>{
    return API.post("/bookings", {vehicle, startDate, endDate, bookingReason});
};

export const getAllBookings = ()=>{
    return API.get("/bookings");
};

export const getMyBookings =()=>{
    return API.get("/bookings/me");
}

export const acceptBooking = (bookingId) =>{
    return API.put(`/bookings/accept/${bookingId}`);
};

export const rejectBooking =(bookingId) =>{
    return API.put(`/bookings/reject/${bookingId}`);
};

export const socket = io(BackenedBaseUrl, {autoConnect: false});
export default API;