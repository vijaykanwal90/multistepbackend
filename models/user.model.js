import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
    minlength: 4,
    maxlength: 20,
    match: /^[^\s]+$/,
  },
   email:{
    type:String,
    required:true,
   },
  profile: {
    type: String,
    
  },

  password: {
    type: String,
    required: true,
    minlength: 8,
  },

  gender: {
    type: String,
  },
dob: {
  type: Date,
  // required: true // or false if optional
},

  profession: {
    type: String,
    enum: ["Developer", "Student", "Entrepreneur"],
  },

  companyName: {
    type: String,
  },

  addressLine1: {
    type: String,
    
  },

  country: {
    type: String,
    
  },

  state: {
    type: String,
    
  },

  city: {
    type: String,
    
  },

  subscription: {
    type: String,
    enum: ["Basic", "Pro", "Enterprise"],
  
  },

  newsLetter: {
    type: Boolean,
  
  },
},
{ timestamps: true }
);
userSchema.methods.verifyPassword = async function (passwordByUser){
  const user = this;
  const passwordHash = user.password;
  const isValid = await bcrypt.compare(passwordByUser, passwordHash);
  return isValid;
}
userSchema.methods.getJWT = async function (){
  // this doest not work with arrow functions
  const user = this;
  const token = await jwt.sign({id:user._id},"Frequent@123",{expiresIn:"1d"});
  return token;
}
export const User = mongoose.model("User", userSchema);
