import { io } from "socket.io-client";

const URL = "https://vehicle-management-nunj.onrender.com";

const socket = io(URL, {
  autoConnect: false,
  transports: ["websocket", "polling"], // important for Render
  withCredentials: true
});

export default socket;