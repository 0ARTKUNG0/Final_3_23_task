const jwt = require("jsonwebtoken");
const User = require("../model/user.model");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const protectedRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwtcookie;
        if(!token){
            res.status(401).json({message: "Unauthorized - Pls login or register first"});
            return;
        }
        //check token is valid
        const decoded = jwt.verify(token, JWT_SECRET);
        if(!decoded){
            res.status(401).json({message: "Unauthorized - Invalid token"});
            return;
        }
        //find user by id and not include password
        const user = await User.findById(decoded.id).select("-password");
        if(!user){
            res.status(404).json({message: "User not found"});
            return;
        }
        req.user = user;
        next();
    } catch (error) {
        console.log("Error in auth middleware:", error.message);
        return res.status(401).json({message: "Unauthorized - Invalid token"});
    }
};
const authMiddleware = {
    protectedRoute
}

module.exports = authMiddleware;