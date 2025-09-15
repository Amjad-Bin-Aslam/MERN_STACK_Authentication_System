import userModel from "../models/userModel.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import transporter from "../config/nodemailer.js";





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

        
        // Sending welcome email
        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to mern_auth',
            text:`Welcome to mern_auth website. Your account has been created with email id: ${email}` 
        };
        await transporter.sendMail(mailOption);


        res.status(201).json({
            success: true,
            message: "User reqistered",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            }
        });


    } catch (error) {
        res.json({ success: false , message: error.message })
    }
};




// login for user
export const login = async (req , res) => {
    const {email , password} = req.body;

    // validation
    if(!email || !password){
        return res.status(400).json({ success: false, message: "Email and Password required" })
    }

    try {
        // check if user exist
        const user = await userModel.findOne({ email });
        if(!user){
            return res.status(404).json({ success: false , message: "User not found" })
        }

        // verify password
        const isMatch = await bcrypt.compare(password , user.password);
        if(!isMatch){
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }


        // Generate token
        const token = jwt.sign({ id: user._id } , process.env.JWT_SECRET , { expiresIn: "7d" })
        

        // saved token in cookies
        res.cookie('token' , token , {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        
        // send response
        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



// logout user
export const logout = async (req , res) => {
    try {
        
        res.clearCookie('token' , {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



// Send Verification OTP to user's mail
export const sendVerifyOtp = async (req , res) => {
    try {
    
        const id = req.userId;

        const user = await userModel.findById(id);

        // Check if user exists
      if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
      } 

      // if user is already verified
        if(user.isAccountVerified){
            return res.json({ success: false , message: "Account already verified" })
        }

       // create the OTP (6 digit)
       const otp = String( Math.floor(100000 + Math.random() * 900000))
       // store otp and expiry
       user.verifyOtp = otp;
       user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    
       // save the updated user data 
       await user.save()

       // send the otp 
       const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Account Verification OTP",
            text: `Your OTP is ${otp}, verify your account using this OTP.`   
       }
       await transporter.sendMail(mailOption)
       
       return res.status(200).json({ success: true, message: "Verification OTP sent on email" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}



// validates the OTP and activates the account
export const verifyEmailOtp = async (req , res) =>{
    
     const { otp } = req.body;
     const userId = req.userId;

    if(!userId || !otp){
        return res.status(404).json({ success: false , message: "Missing details" })
    }

    try {
       
       const user = await userModel.findById(userId); 

       // user exist or not
       if(!user){
            return res.status(404).json({ success: false , message: "User not found" })
       }

       // does verifyOtp match the otp send to mail of user
       if(user.verifyOtp === '' || user.verifyOtp !== otp){
            return res.status(404).json({ success: false , message: "Invalid OTP" })
       }

       // check the expiry time for otp
       if(user.verifyOtpExpireAt < Date.now()){
            return res.status(404).json({ success: false, message: "OTP expired" })
       }

       // mark account as verified
       user.isAccountVerified = true,
       user.verifyOtp = '',
       user.verifyOtpExpireAt = 0,
       await user.save();

       return res.json({ success: true , message: "Account verified successfully" })

    } catch (error) {
        return res.status(404).json({ success: false , message: error.message })
    }
}



// check that is user already logged in or not
export const isAuthenticated =  async (req , res) => {
    try {
        
        res.status(200).json({ success: true  })

    } catch (error) {
         return res.status(404).json({ success: false , message: error.message })
    }
} 



// send OPT of password reset
export const sendResetOtp = async (req , res) =>{
    const {email} = req.body;

    if(!email){
        return res.status(400).json({ success: false , message: "Email is required" })
    }

    try {

        const user =  await userModel.findOne({email});

        if(!user){
            return res.status(404).json({ success: false , message: "User not found" })
        }

        // create reset otp
        const otp = String( Math.floor(100000 + Math.random() * 900000))
        
        // store the otp 
        user.resetOtp = otp;
        // expiry of otp
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Password Reset OTP",
            text: `Your  OTP for resetting your password is ${otp}.`   
       }
       await transporter.sendMail(mailOption)

       return res.status(200).json({ success: true , message: "OTP sent to your email" })

    } catch (error) {
        return res.status(404).json({ success: false , message: error.message })
    }
}



// Reset user password using the reset password OTP
export const resetPassword =  async ( req , res ) => {
    const { email , otp , newPassword } = req.body;

    if(!email || !otp || !newPassword){
        return res.status(404).json({ success: false , message: "Missing details" })
    }

    try {

        const user = await userModel.findOne({email});
        
        if(!user){
            return res.status(404).json({ success: false , message: "user not found" })
        }

        if(user.resetOtp === '' || user.resetOtp !== otp){
            return res.status(404).json({ success: false , message: "Invalid OTP" })
        }

        if(user.resetOtpExpireAt < Date.now()){
            return res.status(404).json({ success: false , message: "OTP Expired" })
        }
        
        // hash the password
        const hashedPassword =  await bcrypt.hash(newPassword , 10);

        // mark user details
        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.status(200).json({ success: true , message: "Password has been reset successfuly" })


    } catch (error) {
        return res.status(400).json({ success: false, message: error.message })
    }
}