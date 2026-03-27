const jwt  = require("jsonwebtoken");
//protect checks token
exports.protect = (req, res, next)=>{
    const auth = req.headers.authorization;
    if(!auth || !auth.startsWith("Bearer")){
        return res.status(404).json({message: "token not found"});
    }
    const token = auth.split(" ")[1]
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch(error){
        return res.status(403).json({message: "Invalid token"});
    }
};
//authorize midlleware checks roles
exports.authorize = (roles)=>{
    return(req, res, nest)=>{
        if(!roles.includes(req.user.role)){
            return res.status(403).json({message: "Forbiden"});
        }
        next();         
    }
    
}