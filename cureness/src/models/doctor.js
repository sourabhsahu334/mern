const mongoose=require("mongoose");
const bcrypt = require ("bcrypt");
const jwt= require("jsonwebtoken");
const employeeSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
  
    email:{
        type:String,
        required:true,
        unique:true,
    },
    gender:{
        type:String,
        required:true,
    },
    phone:{
        type:Number,
        required:true,
        unique:true
    },
    address:{
        type:String
        
    },
   
   
   
    password:{
        type:String,
        required:true,

    },
    confirmpassword:{
        type:String,
        required:true,
    },
    
  
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    appointmnents:[{
        name:{type:String},
        email:{type:String},
        phone:{type:String},
        DOB:{type:String},
        
        
    }
        

    ],
    date:[
        {
            type:Number
        }
    ],
    day:[
        {
            type:Number
        }
    ]

});
employeeSchema.methods.generateAuthToken=async function(){
    //into hash
    try {
        const token =jwt.sign({_id: this._id},"doctorisprotectourlifeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
        console.log(token);
        this.tokens=this.tokens.concat({token});
        await this.save();
        return token;
    } catch (error) {
        
        console.log(error);
    }
}



//we need to create our collection by our shcmea

const doctor=new mongoose.model("doctor",employeeSchema);
module.exports=doctor;