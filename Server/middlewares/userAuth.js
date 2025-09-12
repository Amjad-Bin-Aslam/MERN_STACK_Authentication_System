// Middle that get the userID from token that is saved in the cookies\

import jwt from "jsonwebtoken";

const userAuth = async (req , res , next) => {
    const {token} = req.cookies;

    if(!token){
        return res.status(404).json({ success: false , message: "Not authorized, login again" })
    }

    try {
        
        const tokenDecode = jwt.verify(tokon , process.env.JWT_SECRET);

        if(tokenDecode.id){
            req.userId = tokenDecode.id;
            next();
        } else {
            return res.status(401).json({ success: false , message: "Not authorized, login again" })
        }

    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
}

export default userAuth;