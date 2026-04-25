const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Import your model

// 1. Protect Middleware: Fetches the actual user from DB
exports.protect = async (req, res, next) => {
    const auth = req.headers.authorization;
    
    if (!auth || !auth.startsWith("Bearer")) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = auth.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Fetch fresh user data from DB using the ID in the token
        const user = await User.findById(decoded.id).select("-password");
        
        if (!user) {
            return res.status(404).json({ message: "User no longer exists" });
        }

        // Attach the full DB user object to the request
        req.user = user; 
        next();
    } catch (error) {
        console.error("Auth Error:", error.message);
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

// 2. Authorize Middleware: Checks the role property we just attached
exports.authorize = (roles) => {
    return (req, res, next) => {
        // Backend Logic Check: Does the user role exist in our allowed array?
        if (!req.user || !roles.includes(req.user.role)) {
            console.log(`Access Denied: User role [${req.user?.role}] not in [${roles}]`);
            return res.status(403).json({ message: "Forbidden: Access denied" });
        }
        next();
    };
};
