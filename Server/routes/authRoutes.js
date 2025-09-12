import express from "express";
import { login, logout, register, sendVerifyOtp, verifyEmailOtp } from "../controllers/authController.js";
import userAuth from "../middlewares/userAuth.js";

const authRouter = express.Router();

authRouter.post('/register' , register);
authRouter.post('/login' , login);
authRouter.post('/logout' , logout);
authRouter.post('/send-verify-otp' , userAuth , sendVerifyOtp);
authRouter.post('/verify-account' , userAuth , verifyEmailOtp);

export default authRouter;