require("dotenv").config();
const MONGOURL = process.env.MONGOURL;
const mongoose = require("mongoose");
mongoose.connect(MONGOURL);
const member = require("../mongoose.models/member");

// jwt
const jwt = require("../middlleware/jwt");

//bcrypt
const bcrypt = require("../middlleware/bcrypt");

// http status text
const httpStatusText = require("../utils/httpStatusText");

//async wrapper
const asyncWrapper = require("../middlleware/asyncWrapper");

// send email
const sendEmail = require("../utils/sendEmail");
// otp
const OTP = require("../utils/otp");

const strongPassword=require("../utils/strongPass");
const createError=require("../utils/createError")
const { decode } = require("jsonwebtoken");
const fs=require("fs")
const path = require('path');
const strongPass = require("../utils/strongPass");

// تحديد المسار النسبي للملف
const filePath = path.join(__dirname, '../public/verifyEmail.html'); 

const test=async()=>{
    console.log("updateeeeeeeeeeeeeeeeeeeeeeeee")
    const members=await member.find();
    members.forEach(async(memb)=>{
        console.log("memberrr",memb)
        memb.verified=true;
        memb.role="member";
        await memb.save()
        console.log(memb)
    })

    

 
} 
// test().catch((error)=>{ 
//     console.log("error",error);  
    
// })

const htmlContent_ofVrify=fs.readFileSync(filePath,"utf-8");
const register =asyncWrapper( async (req, res,next) => {
        let { name, email, password, committee, gender, phoneNumber } = req.body;
        let oldEmail = await member.findOne({ email });
        if (oldEmail) {
            // console.log("old member", oldEmail);
            const error=createError(400, httpStatusText.FAIL,"This email is already exist. Please log in or use a different email.")
            throw(error);
        }
        const strong=await strongPassword(password);
       if(strong.length!=0){
        const error=createError(400, httpStatusText.FAIL,strong)
        throw(error);
       }
        

        let hashedpass = await bcrypt.hashing(password);
        const newMember = new member({
            name,
            email,
            password:hashedpass,
            committee,
            gender,
            phoneNumber,
        })
        await newMember.save();
        const token = await jwt.generateToken({  email }, "10m");
        // https://assiut-robotics-zeta.vercel.app/
        const token_url=`https://assiut-robotics-zeta.vercel.app/members/verifyEmail/${token}`
        console.log("req.body is : ", req.body);
        await sendEmail({
            email: email,
            subject: "Confirm Your Email - Assiut Robotics Team",
            text: "Verify Email",
            html:htmlContent_ofVrify.replace('{{token_url}}',token_url)            ,
        });
        res.status(200).json({
            status: httpStatusText.SUCCESS,
            data: null,
            message: "verify your email by click on the link on your email ",
         
        });

});

const verifyEmail =asyncWrapper( async (req, res,next) => {

        let { email } = req.decoded;
        let existMember = await member.findOne({ email });
        // console.log("old member", oldEmail);
        existMember.verified=true;
        await existMember.save();
        const filePath = path.join(__dirname, '../public/response_of_verify.html');

        const htmlContent=fs.readFileSync(filePath,"utf-8");
        res.status(201).end(htmlContent);
   
})

const login =asyncWrapper( async (req, res) => {

        console.log("body", req.body);
        const { email, password, remember } = req.body;
        const oldMember = await member.findOne({ email });

        if (!oldMember) {
            const error=createError(404, httpStatusText.FAIL,"User not Found")
            throw(error);
        }


        if(!oldMember.verified){
            res.status(400).json({
                status: httpStatusText.FAIL,
                data: null,
                message: "verify your email by click on the link on your email ",     
            });
        }


        const truePass = await bcrypt.comparePassword(password, oldMember.password);
        if (!truePass) {
            const error=createError(400, httpStatusText.FAIL,"wrong password")
            throw(error);
        }


        if (oldMember.role == "not accepted") {
            const error=createError(400, httpStatusText.FAIL,"wait until your account be accepted")
            throw(error);
        } 


        const token = await jwt.generateToken({ email},remember);
            
        res.status(200).json({
            status: httpStatusText.SUCCESS,
            data: {token: token},
            message: "Your are logged in",
        });

    
});

const getAllMembers =asyncWrapper( async (req, res) => {
 
        let members = await member.find({}, { password: false });

        res.status(200).json({
            status: httpStatusText.SUCCESS,
            data: {
                members,
            },
            message: "get members successfully",
        });

});

const verify =asyncWrapper( async (req, res) => {
    try {
        if (req.decoded) {
            const oldMember = await member.findOne({ email: req.decoded.email });
            if (oldMember) {
                res.status(200).send({ message: "success authorization", data: oldMember });
            } else {
                res.status(401).send({ message: " unauthorized" });
            }
        }
    } catch (error) {
        res.status(401).send({ message: " unauthorized" });
    }
});
// roles {"not accepted"}
const confirm =asyncWrapper( async (req, res) => {
        const { id, accepted } = req.body;
        if(!accepted){
            await member.findByIdAndDelete(id);
            res.status(200).json({
                status: httpStatusText.SUCCESS,
                data: null,
                message: "deleted",
            });
        }
        const Member=await member.findByIdAndUpdate(id, { role:"member" });
        const filePath = path.join(__dirname, '../public/accepted.html');

        const htmlContent=fs.readFileSync(filePath,"utf-8");
        await sendEmail({
            email: email,
            subject: "accepted - Assiut Robotics Team",
            text: "acception Email",
            html:htmlContent.replace('{{name}}',Member.name)            ,
        });
        res.status(200).json({
                status: httpStatusText.SUCCESS,
                data: null,
                message: " accpeted ",
        });
});

const controleHR = async (req, res) => {
    try {
        const { id, committee } = req.body;

        await member.findByIdAndUpdate(id, { committee: "HR-" + committee, role: 3 });
        res.status(200).json({
            status: httpStatusText.SUCCESS,
            data: null,
            message: "done",
        });
    } catch (error) {
        res.status(501).json({
            status: httpStatusText.ERROR,
            data: null,
            message: error.message,
        });
    }
};
const changeHead = async (req, res) => {
    try {
        const old_id = req.body.old_id;
        const new_id = req.body.new_id;
        await member.findOneAndUpdate({ _id: old_id }, { role: 4 });
        const newHead = await member.findOneAndUpdate({ _id: new_id }, { role: 2 });
        // await member.save();
        newHead.save();

        res.status(200).json({
            status: httpStatusText.SUCCESS,
            data: null,
            message: "done",
        });
    } catch (error) {
        res.status(400).send({
            status: httpStatusText.FAIL,
            data: null,
            message: error.message,
        });
    }
};

const generateOTP = async (req, res) => {
    const { email } = req.params;
    // console.log(email);
    let oldmember = await member.findOne({ email });
    if (oldmember) {
        let code = await OTP.generateOtp();
        // console.log(oldmember);
        await sendEmail({
            email: oldmember.email,
            subject: " OTP",
            text: "my code is :",
            html: `  code <hr> ${code}`,
        });
        res.status(200).json({
            status: httpStatusText.SUCCESS,
            data: null,
            message: "check your email ",
        });
    } else {
        res.status(404).json({
            status: httpStatusText.FAIL,
            data: null,
            message: "this user not found",
        });
    }
};

const changePass = async (req, res) => {
    try {
        const { email, newpass } = req.body;
        let hashedpass = await bcrypt.hashing(newpass);

        const updated = await member.findOneAndUpdate({ email }, { password: hashedpass });
        if (updated) {
            res.status(200).json({
                status: httpStatusText.SUCCESS,
                data: updated,
                message: "updated success",
            });
        } else {
            res.status(404).json({
                status: httpStatusText.FAIL,
                data: null,
                message: "this user not found",
            });
        }
    } catch (error) {
        res.status(400).send({
            status: httpStatusText.FAIL,
            data: null,
            message: error.message,
        });
    }
};


const rate=async (req,res)=>{
    try {
        console.log(req.decoded);
        const committee= req.decoded.committee.split("-")[0];
        console.log(committee);
        if(committee=="HR")
        {
            const {ID,rate}=req.body;
            const MEMBER=await member.findById(ID);
            // if(MEMBER.committee=="web"){
            //     MEMBER.rate=9.5;
            // }else{
            //     MEMBER.rate=rate;
            // }
            MEMBER.rate=rate;
            if(rate<6){
                MEMBER.alerts+=1;
                if(MEMBER.alerts>2){
                    MEMBER.warnings+=1;
                    MEMBER.alerts=0;

                }
            }
            if(MEMBER.warnings>2){
                console.log("delete");
                await member.deleteOne({_id:ID});
            }
            MEMBER.save();
            res.status(200).json({
                status: httpStatusText.SUCCESS,
                data:null ,
                message: "updated success",
            });
        }else{
            res.status(401).send({
                status: httpStatusText.FAIL,
                data: null,
                message: " not HR",
            }); 
        }

  
 
    } catch (error) {
        res.status(400).send({
            status: httpStatusText.FAIL,
            data: null,
            message: error.message,
        }); 
    }
}


const changeProfileImage=async(req,res)=>{
try {
    
    //  const{ID}=req.body;
     const oldMember = await member.findOne({ email: req.decoded.email });
     
     if(oldMember){
            oldMember.avatar=req.imageUrl;
            oldMember.save();
            res.status(200).json({
                status: httpStatusText.SUCCESS,
                data: null,
                message: "profile image is changed successfully",
            });

        }else{
            res.status(400).json({
                status: httpStatusText.ERROR,
                data: null,
                message: "member not found",
            });

        }

    } catch (error) {
            res.status(400).json({
            status: httpStatusText.ERROR,
            data: null,
            message: error.message,
        });
    }
            

    


}


module.exports = {
    register,
    verifyEmail,
    login,
    getAllMembers,
    verify,
    confirm,
    controleHR,
    changeHead,
    generateOTP,
    changePass,
    rate,
    changeProfileImage
};
