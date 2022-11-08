const { request } = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const express=require('express');
const app=express();
const path=require('path');
const cors=require('cors');
const multer = require('multer');
const removeUploadedFiles = require('multer/lib/remove-uploaded-files');
const { MulterError } = require('multer');
const port = process.env.PORT || 5000;

app.use(cors());


// const storage=multer.diskStorage({
//     destination:path.join(__dirname,'../public_html','uploads'),
//     filename:function (req,file,cb) {
//         cb(null,Date.now()+'-'+file.originalname)
        
//     }
// })
// app.post('/imageupload',async(req,res)=>{
//     try{ 

//         let upload=multer({storage:storage}).single('avatar');

//         upload(req,res,function(err){
//             if(!req.file){
//                 return res.send('Please select an image to upload');
//             }
//             else if (err instanceof multer.MulterError){
//                 return res.send(err);

//             }
//             else if(err){
//                 return res.send(err)
//             }

//         });

//     }catch(err){console.log(err)}

// })
//C2DOkHjuxWfLqsxP
//AlienDB

app.get('/',(req,res)=>{
    res.send('API RUNNING')
});



const uri = "mongodb+srv://AlienDB:C2DOkHjuxWfLqsxP@cluster0.wbiuqtd.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run (){
    try{
        const servicesCollection =client.db('AlienPhotographyDatabase').collection("services");
        const service={
            name:"test",
            price:"test"
        }
        const result=await servicesCollection.insertOne(service);
        console.log(result);

    }
    finally{

    }

}
run().catch(err=>console.log(err));





app.listen(port,()=>console.log(`Server is running on ${port}`))