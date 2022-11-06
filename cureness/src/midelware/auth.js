const jwt = require ("jsonwebtoken");
const register=require("../models/patient");

const auth= async(req,res,next)=>{
  try {
    
        const token = req.cookies.jwt ;
        const verifyUser= jwt.verify(token,"mynameisourabhiamcromnarsighgarhmadhyapreadesh");
        console.log(verifyUser);
        next();
  } catch (error) {
    res.send(error);
  }
       
    
}
module.exports= auth;