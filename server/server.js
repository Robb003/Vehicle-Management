require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const connectDB = require("./config/db");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// 1. Improved Socket.io Config for Render
const io = new Server(server, {
    cors: {
        origin: "https://vehicle-managementfrontend.onrender.com",
        methods: ["GET", "POST"],
        credentials: true,
    },
    transports: ["websocket", "polling"] // Allow both, but client should prefer websocket
});

app.set("io", io);

// Attach socket logic
require('./socket')(io);

// 2. CORS Middleware - must match the socket origin exactly
app.use(cors({
    origin: "https://vehicle-managementfrontend.onrender.com",
    credentials: true,
}));

app.use(express.json());

// 3. Health Check Route (Helps Render keep the service alive)
app.get("/health", (req, res) => res.status(200).send("Server is Live"));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/vehicle", require("./routes/vehicleRoutes"));

// Connect DB
connectDB();

// 4. Port Binding - Render uses process.env.PORT automatically
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => { // "0.0.0.0" is important for cloud deployments
    console.log(`Server running on port ${PORT}`);
});
