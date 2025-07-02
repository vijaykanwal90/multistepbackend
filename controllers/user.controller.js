// import express from 'express';
import {User} from '../models/user.model.js';

import jwt from "jsonwebtoken"
import { uploadCloudinary } from "../utils/cloudinary.js";
import bcrypt from "bcryptjs";

const registerUser = async (req, res) => {
  try {


    let { userName, email, password } = req.body.formData;
    console.log(" Incoming register request with:", { userName, email });
    
    if (!userName || !email || !password) {
      console.error(" Validation failed: Missing fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    userName = userName.toLowerCase();

    const exists = await User.findOne({ userName: userName });
    if (exists) {
      console.error(" Username already exists:", userName);
      return res.status(409).json({ message: "Username already exists" });
    }

    if (!isStrongPassword(password)) {
      console.error(" Weak password provided");
      return res.status(400).json({ message: "Password is too weak" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      userName,
      password: hashedPassword,
      email,
    });

    const savedUser = await user.save();

    const token = jwt.sign(
      { id: savedUser._id, userName: savedUser.userName },
      "Frequent@123",
      { expiresIn: "7d" }
    );

    const { password: _, ...userData } = savedUser.toObject();

    console.log(" User registered successfully:", userData);

    return res.status(201).json({
      message: "User created successfully",
      token,
      data: userData,
    });
  } catch (error) {
    console.error(" Registration Error:", error.message || error);
    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

const loginUser = async (req, res) => {
  const { userName, password } = req.body;

  try {
    if (!userName || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ userName });
    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const checkPassword = await bcrypt.compare(password, user.password); // Assuming you're using bcrypt

    if (!checkPassword) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      { id: user._id, userName: user.userName },
      "Frequent@123",
      { expiresIn: "7d" }
    );

    const { password: _, ...userData } = user.toObject(); // exclude password from returned data

    return res.status(200).json({
      message: "User logged in successfully",
      token,
      data: userData,
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};
const getUser = async( req,res)=>{
  try {
    const userId = req.user.id; // Assuming you have middleware to set req.user
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId).select("-password"); // Exclude password field
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
    });
    
  }
}
const validatePersonalData = async (req, res) => {
  try {
    
  
  const {userName,currentPassword,newPassword}= req.body;
  const userId= req.user.id;
  const user = await User.findById(userId);
  if (newPassword) {
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Invalid current password" });
    }
  }
  if (userName && userName !== user.userName) {
    const existingUser = await User.findOne({ userName });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Username already taken" });
    }
  }

  return res.status(200).json({ success: true, message: "Validation passed" });
}
  catch (error) {
    console.error("Validation error:", error);
    return res.status(500).json({ success: false, message: "Server error during validation" });
  }
  

}
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("updating profiel")
   
    const parsedFormData = JSON.parse(req.body.formData);

    const {
      userName,
      email,
      newPassword,
      profession,
      companyName,
      addressLine1,
      country,
      state,
      city,
      subscriptionPlan,
      newsletter,
      gender,
      dob,
    } = parsedFormData;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Handle profile image upload
    const profilePhoto = req.file;
    let cloudinaryImageUrl = user.profilePhoto;

    if (profilePhoto) {
      try {
       

        const uploadResult = await uploadCloudinary(profilePhoto.path);
        cloudinaryImageUrl = uploadResult?.secure_url || user.profilePhoto;
      } catch (err) {
        console.error("Image upload failed:", err);
        return res.status(500).json({ message: "Failed to upload image" });
      }
    }

    //  Update user fields
    user.profilePhoto = cloudinaryImageUrl;
    if (userName) user.userName = userName;
    if (email) user.email = email;
    if (profession) user.profession = profession;
    if (companyName) user.companyName = companyName;
    if (addressLine1) user.addressLine1 = addressLine1;
    if (country) user.country = country;
    if (state) user.state = state;
    if (city) user.city = city;
    if (subscriptionPlan) user.subscription = subscriptionPlan;
    if (typeof newsletter !== "undefined") user.newsLetter = newsletter;
    if (gender) user.gender = gender;
    if (dob) user.dob = dob;

    //  Handle password update
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: safeUser,
    });

  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "Server error during profile update" });
  }
};
const logout = async (req, res) => {
  try {
   
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Logout failed" });
  }
};
export const isStrongPassword = (password) => {
    const minLength = 8;
    const hasNumber = /\d/;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;
    const hasUppercase = /[A-Z]/;
  
    if (password.length < minLength) return false;
    if (!hasNumber.test(password)) return false;
    if (!hasSpecialChar.test(password)) return false;
    if (!hasUppercase.test(password)) return false;
    
    return true;
  };
  
 
  
export {registerUser,loginUser,getUser,validatePersonalData,updateProfile,logout}