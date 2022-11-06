const { Grid } = require('gridfs-stream');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const db1="mongodb+srv://sourabh2:18jan2002@cluster0.88wwojw.mongodb.net/test"
const mongoURI="mongodb+srv://sourabh:18jan2002@cluster1.bw6g0pq.mongodb.net/Registration"
const local="mongodb://localhost:27017/Registration"
// Connect MongoDB at default port 27017.
const conn =mongoose.connect(mongoURI, {
    useNewUrlParser : true ,
    useUnifiedTopology : true


   
}).then(()=>{
    console.log('connection succes');
}).catch((e)=>{
    console.log('no connect'+e);
});
