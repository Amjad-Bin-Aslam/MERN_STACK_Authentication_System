import userModel from "../models/userModel.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'



// Creating a new user for first time 
export const register =  async (req , res) => {
    const {name , email , password} = req.body;

    if(!name || !email || !password){
        return res.status(400).json({ success: false , message: "Missing Details" })
    }; 

    try {

        const existingUser = await userModel.findOne({email});

        if(existingUser){
            return res.status(409).json({ success: false , message: "User already exist" });
        }

        const hashedPassword = await bcrypt.hash(password , 10);

        const user = await userModel.create({
            name,
            email,
            password: hashedPassword,
        });

        // JWT token
        const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET , 
        {expiresIn: '7d'} 
        );


        //cookies: saving the jwt in cookies
        res.cookie('token' , token , {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            success: true ,
            message: "User reqistered",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        res.json({ success: false , message: error.message })
    }

};