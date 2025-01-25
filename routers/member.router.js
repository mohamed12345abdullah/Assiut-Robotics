const express = require("express");

const memberControler = require("../controler/member.controler");
const JWT = require("../middlleware/jwt");
const Router = express.Router();
const multer = require("multer");
const otp = require("../utils/otp");



const { uploadToCloud } = require("../utils/cloudinary");


// const diskStorage = multer.diskStorage({
//         destination: (req, file, cb) => {
//                 cb(null, "books/");
//         },
//         filename: (req, file, cb) => {
//                 const ext = file.mimetype.split("/")[1];
//                 const filename = `${file.originalname}_.${ext}`;
//                 console.log("file", file);

//                 cb(null, filename);
//         },
// });

// const fileFilter = (req, file, cb) => {
//         const imageType = file.mimetype.split("/")[1];
//         if (imageType == "img") {
//                 return cb(null, true);
//         } else {
//                 return cb("I don't have a clue!", false);
//         }
// };
// const upload = multer({
//         storage: diskStorage,
//         fileFilter,
// });



// Multer configuration



const diskStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "uploads/"); // Save locally before uploading to Cloudinary
        },
        filename: (req, file, cb) => {
            const ext = file.mimetype.split("/")[1];
            const filename = `${file.originalname.split(".")[0]}_${Date.now()}.${ext}`;
            req.myFileName = filename;
            cb(null, filename);
        },
    });
    
    const fileFilter = (req, file, cb) => {
        const imageType = file.mimetype.split("/")[1];
        if (imageType === "jpg" || imageType === "jpeg" || imageType === "png") {
            return cb(null, true); // Only allow JPG and PNG files
        } else {
            return cb(new Error("Only images (jpg, jpeg, png) are allowed!"), false);
        }
    };
    
    // Multer middleware
    const upload = multer({
        storage: diskStorage,
        fileFilter,
    });
    

Router.route("/verifyEmail").post(memberControler.verifyEmail);

Router.route("/createAccount/:token").get(
        JWT.verify,
        memberControler.createAccount
);

Router.route("/getAllMembers").get(memberControler.getAllMembers);

Router.route("/login").post(memberControler.login);

Router.route("/verify").post(JWT.verify, memberControler.verify);

Router.route("/confirm").post(JWT.verify, memberControler.confirm);

Router.route("/changeHead").post(JWT.verify, memberControler.changeHead);

Router.route("/hr").post(JWT.verify, memberControler.controleHR);

Router.route("/generateOTP/:email").get(memberControler.generateOTP);

Router.route("/verifyOTP").post(otp.verifyOtp);

Router.route("/changePass").post(memberControler.changePass);


Router.route("/rate").post(JWT.verify,memberControler.rate);

Router.route("/changeProfileImage").post(
        upload.single("image"), 
        async (req, res,next) => {
            try {
                if (!req.file) {
                    return res.status(400).send('No file uploaded.');
                }
    
                // Upload image to Cloudinary using the utility function
                const imageUrl = await uploadToCloud(req.file.path); // Passing the file path to Cloudinary
                req.imageUrl=imageUrl;
                next()
            //     res.status(200).json({
            //         message: 'Image uploaded successfully!',
            //         url: imageUrl, // Cloudinary URL of the uploaded image
            //     });
            } catch (error) {
                res.status(500).json({ message: 'Error uploading image', error });
            }
        },JWT.verify,memberControler.changeProfileImage
)  
module.exports = Router;
