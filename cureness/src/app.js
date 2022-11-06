const Exceljs= require('exceljs');
const cheerio = require('cheerio');
const moment= require('moment');
const cookie= require("cookie");
const express = require("express");
const ejs = require('ejs');
const xlsx= require('xlsx');
const axios= require('axios');
const request = require('request');
const app= express();
const server = require('http').Server(app)
const io = require('socket.io')(server)
// include node fs module
var fs = require('fs');

const path= require("path");
const port= process.env.PORT || 5000;
const hbs= require("hbs");
require("./db/conn");
const patient=require("./models/patient");
const doctor = require( "./models/doctor");
const bcrypt=require("bcrypt");
const jwt= require("jsonwebtoken");
const route= require('./routes/routes');
const { json } = require('stream/consumers');
const auth = require( "./midelware/auth");
const auth2= require("./midelware/auth2");
const rout= require("./routes/routes");
const cookieParser = require("cookie-parser");
//const student = require('./models/teachers');
const static_path=path.join(__dirname,"../public" );
const template_path=path.join(__dirname,"../templates/views" );
const partial_path= path.join(__dirname,"../templates/partials");
app.use(express.static('./templates/public'))
const multer  = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, Date.now()+file.originalname )
    }
  })
  const upload = multer({ storage: storage })
  
app.use("/",rout);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));
app.use (express.static(static_path));
app.set("view engine", "hbs");
app.set("view engine", "ejs")
app.set("views",template_path);
hbs.registerPartials(partial_path);





app.post("/patientregister",upload.single('file'),async(req,res,next)=>{
    try{
//dialog 
         const password = req.body.password;
        const cpassword= req.body.confirmpassword;
        console.log("s1");

        if(password=== cpassword){
            const registerEmployee= new patient({

        
            name: req.body.name,
            
            email: req.body.email,
            gender:req.body.gender,
            phone: req.body.phone,
            address:req.body.address,
            
            password:req.body.password,
            confirmpassword:req.body.confirmpassword,

            })

            const token = await registerEmployee.generateAuthToken();
             
             const registerd= await registerEmployee.save();
            console.log(registerd);
           
            res.status(201).render("first.hbs");
         }
        else{
            res.send("password is not match")
        }

    }catch (error){
        res.status(400).send(error);
        console.log("error ="+error )

    }
});
app.post("/patientlogin",async(req,res) =>{
    try {
        const name= req.body.username;
        const email= req.body.email;
        const password= req.body.password;

       const useremail = await patient.findOne({email:email});

       
      // const ismatch= await bcrypt.compare(password,useremail.password);
       var token = await useremail.generateAuthToken();
       console.log(token);
       res.cookie ("jwt", token , {
        expires:new Date(Date.now() + 6000000 ) ,
       httpOnly:true
     });
       

        if(useremail.password===password){
          
             return res.render("patientdashboard.hbs");
        }
        else{
            res.send("invalid login details");
        }
     } catch (error) {
        console.log("invalid details"+error);
    }
});
app.post('/doctorregister',async(req,res)=>{
    const password = req.body.password;
    const cpassword= req.body.confirmpassword;
    console.log("s1");

    if(password=== cpassword){
        const registerEmployee= new doctor({

    
        name: req.body.name,
        
        email: req.body.email,
        gender:req.body.gender,
        phone: req.body.phone,
        address:req.body.address,
        
        password:req.body.password,
        confirmpassword:req.body.confirmpassword,

        })

        var  token = await registerEmployee.generateAuthToken();
         
         const registerd= await registerEmployee.save();
        console.log(registerd);
       
        res.status(201).render("first.hbs");
     }
    else{
        res.send("password is not match")
    }
})
app.post( '/doctorlogin',async(req,res)=>{
    try {
        const name= req.body.username;
        const email= req.body.email;
        const password= req.body.password;

       const useremail = await doctor.findOne({email:email});

       
      // const ismatch= await bcrypt.compare(password,useremail.password);
       const token = await useremail.generateAuthToken();
       console.log(token);
       res.cookie ("jwt", token , {
        expires:new Date(Date.now() + 6000000 ) ,
       httpOnly:true
       
     });
     console.log("s1")
       

        if(useremail.password===password){
          
            res.render("doctordashboard.hbs");
        }
        else{
            res.send("invalid login details");
        }
     } catch (error) {
        console.log("invalid details"+error);
    }
});
app.get('/network',auth,(req,res)=>{
    res.send('here chatroom')
});
app.get('/patientdashboard',(req,res)=>{
  res.render('patientdashboard.hbs')
});
app.get('/doctordata', async(req,res)=>{
      const data= await doctor.find();
      res.send(data);

       
});
app.get('/getdoctordata',(req,res)=>{
    axios.get('http://localhost:5000/doctordata').then(function(response){
        var i=1;
        console.log(response.data);
        res.render('getdoctordata.hbs',{user:response.data,j:1});
    })
});
app.get('/doctorappointments',(req,res)=>{
    axios.get("http://localhost:5000/doctordata").then(function(response){
        console.log(response.data);
        
    })
});
app.get('/myprofile',(req,res)=>{
    res.render('doctorprofile.hbs')
})

app.get('/getdoctor',auth,(req,res)=>{
    res.render('doctor.hbs')
})
app.get('/home',(req,res)=>{
    res.render('homep.hbs');
})
let appointdoctor;
let doctoremail
app.post('/getdoctor',auth,async(req,res)=>{
    const name = req.body.name;
     doctoremail= req.body. email;
    appointdoctor = doctoremail;
    const data = await doctor.findOne({email:doctoremail})
    console.log(data);
    res.render('doctorid.hbs',{data:data,image:"https://images.pexels.com/photos/6129049/pexels-photo-6129049.jpeg?auto=compress&cs=tinysrgb&w=600"});
});
app.get('/appointment',(req,res)=>{
    console.log(appointdoctor)
    res.render('appointment.hbs')
})

let alert = require('alert'); 



app.post('/appointment',async(req,res)=>{
    const name = req.body.name ;
    const useremail = req.body.email;
    const phone = req.body.phone;
    
    const doctordata= await doctor.findOneAndUpdate({email:useremail},{
        $addToSet:{
            appointmnents:{
                name:name,
                email:useremail,
                phone:phone
            }

        },
        
    });
    console.log(doctordata)
    
    alert('message')
    

});
app.get('/ai',(req,res)=>{
    res.render('aibot.hbs')
})
app.post('/ai',(req,res)=>{
    let data = `<h1>${"here you can chat with your virtul consultant"}</h1>`
    const brain = require( './brain-browser')
const trainData  = require('./scr1/training-data')
const serializer = require('./scr1/serializer')
const net        = new brain.NeuralNetwork()

net.train(serializer.serialize(trainData))

const output = net.run(serializer.encode('i am so sad and lose control'));

console.log(output);
console.log(output.happy)
if( output.happy)
res.render('aibot.hbs',{ answer:output.happy})
 

})



const rooms = { }

app.get('/chatroom',auth2, (req, res) => {
  res.redirect('http://localhost:3000/chatroom')
});




app.get('/medicines',(req,res)=>{
    let data;
    let final;
    request('https://www.medindia.net/drugs/medical-condition/commoncold.htm',cd);
function cd( error, response, html) {
 if( error){
    console.log(error);
 }
 else{
    handlehtml(html)
 }
};
function handlehtml(html){
    let $=cheerio.load(html);
    let result;
     data = $('.disc.report-content');
     for(let i =0 ; i< data.length;i++){
         result= $(data[i]).text();
        


     }
     final = data.text();
     console.log(final)
    console.log('s')
    
   

    
}
const { nanoid } = require("nanoid")
const id = nanoid();
console.log(id(10));
let content = JSON.stringify(final);
     res.render('medicines.hbs',{user:content})
})
const currentYear = new Date().getFullYear();

const currentMonth = new Date().getMonth() + 1;

const currentDay = new Date().getDate();

const together = [currentYear, currentMonth, currentDay].join('/');
console.log(together); // 👉️ 2025/10/24

// 👇️ Get Names of Month instead of Digits
const nameOfMonthUS = new Intl.DateTimeFormat('en-US', {month: 'long'}).format(
  new Date(),
);
//console.log(nameOfMonthUS); // 👉️ October

const nameOfMonthDE = new Intl.DateTimeFormat('de-DE', {month: 'long'}).format(
  new Date(),
);
//console.log(nameOfMonthDE);






































app.get('/sheet',auth,async(req,res,next)=>{
    const startdate= moment(new Date()).startOf('month').toDate();
    const enddate= moment(new Date()).endOf('month').toDate();
    try {
        console.log("s1");
        const  users = await Register1.find({created_At:{$gte: startdate, $lte:enddate}});
        const workbook= new Exceljs.Workbook();
        const worksheet = workbook.addWorksheet ('users');
        worksheet.columns=[{
            header:'s_no',key:'s_no',width:10},
       { header:'Email',key:'email',width:35},
       {header:'Name',key:'firstname',width:40},
    
    ];
    console.log("s2");
    let count =1 ;
    users.forEach(user => {
        user.s_no = count;
        worksheet.addRow(user) ;
        count+=1;
    }); 
    console.log("s3");
    worksheet.getRow(1).eachCell((cell)=>{
        cell.font={bold:true};
    });
    console.log("s4");
    const data = await workbook.xlsx.writeFile('users.xlsx');
    console.log("s5");
    const excelToJson = require('convert-excel-to-json');
 
const result = excelToJson({
    sourceFile: './uploads/Book1.xlsx',
    columnToKey: {
        A: 'name',
        C: 'email',
        
    }
    
});
console.log(result)
    } catch (error) {
        consolelog(error);
    }
});



app.get('/login/marks',auth2,(req,res)=>
{
    res.render('marks');
});
app.post('/login/marks',async(req,res)=>{
    const email= req.body.email;
    const mathmakrs= req.body.mathmarks;
    const sciencemarks = req.body.sciencemarks;
    try {
      const result = await Register1.updateOne({email:email},{
          $set:{
               "math":mathmakrs,
               "sceince":sciencemarks
           }
        });
      console.log( "hi this is succesfull ");
      res.render('main')
   
    } catch (error) {
      console.log(error);
    }
  
    

})
app.get('/login/marksheet',auth,(req,res)=>
{
    res.send('thier is no imformation such feed by you ');
});
app.get('/get-attendence',auth,(req,res)=>{
    res.render('stat');
})
  // student attendence
app.post('/get-attendence',auth,async(req,res)=>{
    try {
        let email = req.body.email;
        const register = await Register1.findOne({email:email});
       const attendence= register.attendence;
       const name= register.firstname;
       const mathmarks= register.math;
       const sciencemarks = register.sceince;
       const address = register.address;
       const fathername= register.fathername;
        var  array={name,email,address,mathmarks,sciencemarks,attendence};
        console.log(array);
        let jsonContent = JSON.stringify(array);
        let data = `<h2> Name : ${array.name} <h2> <h2> email : ${array.email} <h2>
        
        <h2> Address : ${array.address} <h2>
        <h2> Fathername : ${array.fathername} <h2>
        <h2> attendence : ${array.attendence} <h2>
        <h2> Mathematic Marks: ${array.mathmarks} <h2>
        <h2> Sceince Marks: ${array.sciencemarks} <h2>
        <h2> Ramarks about : ${array.name} is good <h2>`
        return res.send(`<h1 > ${data}</h1>`);
       } catch (error) {
        console.log( error);
       }
  // return res.send(jsonContent);
});
app.get('/updateattendence', auth ,(req,res)=>{
    try {
        res.render('updateattendence');
    } catch (error) {
        console.log(error);
    }
});
app.post('/updateattendence' ,async(req,res)=>{
      const email= req.body.email;
      const att= req.body. attendence;
      try {
        const result = await Register1.updateOne({email:email},{
            $set :{ "attendence":att}});
        
      } catch (error) {
        console.log(error);
      }
});

app.get('/deletestudent' , auth,(req,res)=>{
    res.render ('delete');
});
app.post('/deletestudent',async(req,res)=>{
    const name= req.body.username;
    const attendence= req.body. attendence;
    try {
      const result = await Register1.deleteOne({email:name})
      console.log(result);
      res.send('done');

    } catch (error) {
      console.log(error);
    }
});
app.get('/logout', (req,res)=>{
 res.clearCookie('jwt');
 res.render('index');

});
app.get('/studentlogin',(req,res)=>{
    res.render('studentlogin')
});
app.post('/studentlogin',async(req,res)=>{
   try {
    let email = req.body.email;
    const register = await Register1.findOne({email:email});
   const attendence= register.attendence;
   const image= register.avatar;
   const name= register.firstname;
   const mathmarks= register.math;
   const sciencemarks = register.sceince;
   const address = register.address;
   const fathername= register.fathername;
    var  array={name,email,address,mathmarks,sciencemarks,attendence,image};
    console.log(array);
    let jsonContent = JSON.stringify(array);
    let data = `<h2> Name : ${array.name} <h2> <h2> email : ${array.email} <h2>
    

    <h2> Address : ${array.address} <h2>
    <h2> Fathername : ${array.fathername} <h2>
    <h2> attendence : ${array.attendence} <h2>
    <h2> Mathematic Marks: ${array.mathmarks} <h2>
    <h2> Sceince Marks: ${array.sciencemarks} <h2>

    `
    
    console.log(data);
    return res.send(`<h1 > ${data}</h1> 
    <img src=${image}  style="width:128px;height:128px;">`);
    
   } catch (error) {
    console.log( error);
   }
});
app.post('/saveAsAsheet',(req,res)=>{
    const excelToJson = require('convert-excel-to-json');
 
const result = excelToJson({
    sourceFile: './uploads/Book1.xlsx',
    columnToKey: {
        A: 'name',
        C: 'email',
        B:'second name'
    }
    
});
console.log(result.Sheet1.A1)
})

app.get( '/studybot',(req,res)=>{
    res.render('bot');
});
app.post( '/bot',(req,res)=>{
    request('https://byjus.com/',cd);
function cd( error, response, html) {
 if( error){
    console.log(error);
 }
 else{
    handlehtml(html);


 }
};
function handlehtml(html){
    let setTool=cheerio.load(html);
    let contentArr=setTool("#maincounter-wrap span");
   

    
}
})
const s="physics";
const t= "thermodynamics"




const pdf = require('pdf-parse');
const { name } = require('ejs');
const { response } = require('express');


 
let dataBuffer = fs.readFileSync('./uploads/RGPV- Smart Card View.pdf');
 
pdf(dataBuffer).then(function(data) {
 
    // number of pages
    //console.log(data.numpages);
    // number of rendered pages
    //console.log(data.numrender);
    // PDF info
    //console.log(data.info);
    // PDF metadata
    //console.log(data.metadata); 
    // PDF.js version
    // check https://mozilla.github.io/pdf.js/getting_started/
    //console.log(data.version);
    // PDF text
    //console.log(data.text); 
        
});






app.listen(port,()=>{
    console.log(`server is running at port ${port}`);
})