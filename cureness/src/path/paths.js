
const auth = require( "../midelware/auth");

exports.about=(req,res,next)=>{
    res.send("hi user page is undermaintenance");
    log.console("seccesss");

   
   

}
exports.login=(req,res,next)=>{
    res.render('first.hbs')
}

