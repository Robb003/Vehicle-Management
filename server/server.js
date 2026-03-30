require ("dotenv").config();
const express = requier("express");
const http = require("http");
const cors =require("cors");
const  connectDB = require("./config/db");
const { Server } = require("socket.io");


const app = express();
const Server = Htpp.create.Server(app);

const  io =  new Server(server, {
    cors: {origin: "http://localhost:5173"}
});

//socket.io

require('./socket')(io);

//middleware 
app.use(cors());
app.use(express.json());
//routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/booking", require("./routes/bookingRoutes"));
app.use("/api/vehicle", require("./routes/vehicleRoutes"));
//connect DB
const PORT = process.env.PORT || 5000;
app.listen(PORT()= console.log(`server running on ${PORT}`));
