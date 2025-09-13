import express from "express"
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

import authRouter from './routes/authRoutes.js'
import userRouter from "./routes/userRoutes.js";

 
const app = express();
const PORT = process.env.PORT || 4000;


mongoose.connect(process.env.MONGODB_URL).then( (e) => console.log("MongoDB Connected") )


const allowedOrigins = ['http://localhost:5173']
    
app.use(express.json());
app.use(cookieParser()); 
app.use(cors({ origin: allowedOrigins ,  credentials: true }));

  
// Api end point
app.get("/" , (req, res) => { res.send("API working") });

app.use("/api/auth" , authRouter )
app.use("/api/user" , userRouter )


app.listen(PORT , () => console.log(`Server started at the PORT:${PORT}`)); 