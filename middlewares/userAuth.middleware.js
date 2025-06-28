import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js";
dotenv.config();


export const userAuth = async(req,res,next)=>{
    try{
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization header missing or malformed' });
          }
      
          const token = authHeader.split(' ')[1];
          // console.log(token)
          // Verify token and get payload
          const payload = jwt.verify(token, 'Frequent@123');
      
          // Support both `userId` and `id` keys
          const userId = payload.userId || payload.id;
          if (!userId) {
            return res.status(401).json({ message: 'Invalid token payload' });
          }
      
          // Fetch user and exclude sensitive fields
          const user = await User.findById(userId).select('-password');
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }
      
          // Attach user to request object
          req.user = user;
        
          next();
    }
    catch(error){
        console.error("User authentication error:", error.message || error);
        return res.status(500).json({
            message: error.message || "Internal server error",
        });
    }
}