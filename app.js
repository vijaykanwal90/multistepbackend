import express from 'express';
// import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import {userRouter} from './routes/user.router.js';
import connectDB from './utils/database.js';

dotenv.config();
const app = express();
// app.use(cors());

app.use(express.urlencoded({ extended: true }));
const allowedOrigins = [
  'http://localhost:5173',
  'https://multi-step-form-frontend-liart.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type', 'Authorization'],
  }));
  
  app.options('*', cors()); // Preflight request handling
  app.use(express.json());
// const PORT = process.env.PORT || 5000;
app.use('/api/user', userRouter);

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(` Server is running at port  ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MONGODB  db connection failed !!!" , err);
})
