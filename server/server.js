import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser  from "cookie-parser";
import connectDB from "./config/mondodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoute.js";
const app = express();
const port=process.env.PORT || 4000;
connectDB();
const allowesOrgin =['http://localhost:5173' , "https://mern-auth-frontend-rx2u.onrender.com"]
app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowesOrgin ,credentials: true}));
//API endpoints
app.get('/' , (req , res) =>res.send("API Working"));
app.use('/api/auth' , authRouter);
app.use('/api/user' , userRouter);
app.listen(port , ()=>console.log(`server started on PORt: ${port}`));
