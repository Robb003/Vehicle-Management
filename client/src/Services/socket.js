import { io } from "socket.io-client";

// Ensure there is NO trailing slash at the end of the URL
const URL = "https://vehicle-management-nunj.onrender.com";

const socket = io(URL, {
  autoConnect: false,
  // For Render, it's often more stable to start with 'websocket' only
  // because they lack sticky sessions for polling upgrades
  transports: ["polling", "websocket"], 
  withCredentials: true,
  reconnectionAttempts: 5,
  timeout: 20000, // Longer timeout for Render "cold starts"
});

// Helpful for debugging the "404" or connection failures
socket.on("connect_error", (err) => {
  console.error("Socket Connection Error details:", err.message);
});

export default socket;
