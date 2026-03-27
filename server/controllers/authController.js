const bcrypt =require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

//signup logic

exports.Signup = async(req, res)=>{
    try {
        const {name, phoneNumber, email, password, location} = req.body;
        const exist = await User.findOne({email: email.toLowerCase() });
        if(exist){
            return res.status(400).json({message: "user already exist"});
        }
        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            phoneNumber,
            email,
            password: hashed,
            role: "Customer",
            location
        });

        const token = jwt.sign({ Id: user._id, role: user.role }, process.env.JWT_SECRET, {expiresIn: '1h'});
        res.json(token);
    } catch(error){
        res.status(500).json({message: error.message});
    }
};

//login endpoint logic

exports.login = async(req, res)=>{
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email: email.toLowerCase() });
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        const match = await bcrypt.compare(password, user.password);
        if(!match){
            return res.status(401).json({message: "Wrong password"});
        }
        const token =  jwt.sign({ Id: user._id, role: user.role}, process.env.JWT_SECRET,{expiresIn: '1h'});
        res.json(token);
    } catch(error){
        res.status(500).json({message: error.message});
    }
};


