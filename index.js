require('dotenv').config();
const PORT=process.env.PORT;


const express=require("express");
const memberRouter=require('./routers/member.router')
const blogRouter=require('./routers/blog.router')
const componentRouter=require('./routers/component.router')

// status text
const httpStatusText=require('./utils/httpStatusText');

//cors

const cors=require('cors');

const app=express(); 


//middlle wares
app.use(cors()); 

// pody barser
const body_parser=require('body-parser');
app.use(body_parser.json());
app.use(body_parser.urlencoded({extended:true}));



// app.use("/",express.static(__dirname+"/views"))
// app.use("/uploads",express.static(__dirname+"/uploads"))
app.use("/members",memberRouter);
// app.use('/blogs',blogRouter);
// app.use('/components',componentRouter);
// app.get("/",async (req,res)=>{    
//   try{
//     const members=await members.findBycommittee(req.params.committee);
  
//   if(!committee){
//        return res.status(404).json({msg:"committee not found"})
//   }
//   res.json(members);
//   }catch(err){
//     return res.status(400).json({msg: "error"})
//   }
// })


app.use("*",(req,res,next)=>{
  res.status(404).json({status:404,message:"not found "});
})


 
app.use((error, req, res ,next)=>{
    res.status(400).json(  { status:httpStatusText.ERROR,
                            message:error.message})
})




const OTP=require('./utils/otp');
const member = require('./mongoose.models/member');


//   app.get('/genOTP',);
//   app.post('/verOTP',, async (req, res) => {
    
//  try {
    

//     const {code}=req.body;
//     console.log("body",req.body);
//     const ok=await OTP.verifyOtp(code);
//     if(ok){
//         res.status(200).json({message:"ok otp "
//         })
//     }else{
//         res.end(" not ok")
//         console.log(ok);
//     }
// } catch (error) {
//     console.log(error.message);
//     res.status(400).json({message:error.message        })


// } 
  
    // });
  // setInterval(() => {
    // fetch("https://assiut-robotics-website.onrender.com/")
    // console.log("sen req");
  // }, 3000);


//   const XLSX = require("xlsx");
//   const fs = require("fs");
//  const axios =require("axios");
  // // تحميل ملف Excel
  // const url="https://docs.google.com/spreadsheets/d/18pOhTSqrmcUsXYE4hwodGGqSu_xZenRLHMPs-8c_tIc/export?format=xlsx"
  // const response = await axios.get(url, { responseType: "arraybuffer" }); // تحميل الملف

  // const workbook = XLSX.readFile(response,data);

  // axios.get(url, { responseType: 'arraybuffer' })
  // .then(response => {
  //   const workbook = XLSX.read(response.data, { type: 'buffer' });
  //   const sheetName = workbook.SheetNames[0];
  //   const sheet = workbook.Sheets[sheetName];
  //   const data = XLSX.utils.sheet_to_json(sheet);
  //   console.log(data);
  // })
  // .catch(err => {
  //   console.error("Error fetching Excel file: ", err);
  // }); 

  // const workbook = XLSX.read(response.data, { type: "buffer" });

  // // اختيار الشيت الأول
  // const sheetName = workbook.SheetNames[0]; 
  // const sheet = workbook.Sheets[sheetName];
  
  // // تحويل البيانات إلى JSON
  // const data = XLSX.utils.sheet_to_json(sheet);
  
  // console.log(data); // عرض البيانات
  
  // استخدام البيانات في السيرفر
  // data.forEach((row) => {
  //   console.log(row);
  // });
  




app.listen(PORT,()=>{
    console.log("server is run and listen to port : ",`http://localhost:${PORT}/`); 
})
 