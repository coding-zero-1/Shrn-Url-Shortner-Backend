import type { NextFunction, Request, Response } from "express";
import jwt  from "jsonwebtoken";

function authMiddleware(req:Request,res:Response,next:NextFunction){
    const token = req.headers.token as string;
    if(!token){
        res.status(401).json({
            success:false,
            error:null,
            data:null,
            msg:"Missing verification token"
        })
    }
    try {
        const decodedToken = jwt.verify(token,process.env.JWT_SECRET!) as {email:string};
        req.userEmail = decodedToken.email;
    } catch (error) {
        
    }
}
export default authMiddleware;