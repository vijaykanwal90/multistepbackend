import express from 'express';
import {userAuth} from '../middlewares/userAuth.middleware.js';
import {registerUser,loginUser,getUser,validatePersonalData,updateProfile,logout} from "../controllers/user.controller.js"
// import {upload} from '../middlewares/upload.middleware.js';
import { upload } from "../middlewares/multer.middleware.js"; 

export const userRouter = express.Router();
userRouter.post('/signup',registerUser);
userRouter.post('/login',loginUser);
userRouter.get('/profile',userAuth,getUser);
userRouter.post('/validate-personalData',userAuth,validatePersonalData);
userRouter.patch('/profileEdit',upload.single('profilePhoto'),userAuth,updateProfile);
userRouter.post('/logout',userAuth,logout)



