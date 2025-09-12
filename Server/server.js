// import { configDotenv } from "dotenv";
import express from "express"
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
// import connectDB from "./config/mongodb.js";

const app = express();
const PORT = process.env.PORT || 4000;


mongoose.connect(process.env.MONGODB_URL).then( (e) => console.log("MongoDB Connected") )

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true }));

app.get("/" , (req, res) => { 
    res.send("API working")
});


app.listen(PORT , () => console.log(`Server started at the PORT:${PORT}`)); 