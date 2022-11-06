const jwt = require ("jsonwebtoken");

require("../models/doctor");
const auth2= async(req,res,next)=>{
  try {
    
        const token = req.cookies.jwt ;
        const verifyUser= jwt.verify(token,"doctorisprotectourlifeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
        console.log(verifyUser);
        next();
  } catch (error) {
    res.send(error);
  }
       
    
}
module.exports= auth2;