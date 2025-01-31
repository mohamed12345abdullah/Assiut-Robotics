const express = require("express");

const memberController = require("../controller/member.controller");
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
        cb(null, "public/"); // Save locally before uploading to Cloudinary
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


Router.route("/register").post(memberController.register);

Router.route("/verifyEmail/:token").get(
    JWT.verify,
    memberController.verifyEmail
);

Router.route("/getAllMembers").get(memberController.getAllMembers);

Router.route("/login").post(memberController.login);

Router.route("/verify").get(JWT.verify, memberController.verify);
// Router.route("/verify").post(JWT.verify, memberController.verify);

Router.route("/confirm").post(JWT.verify, memberController.confirm);

Router.route("/generateOTP").post(memberController.generateOTP);

Router.route("/verifyOTP").post(memberController.verifyOTP);

Router.route("/changePassword").post(memberController.changePass);

Router.route("/get/:com").get(memberController.getCommittee)

Router.route("/:memberId/addTask").post(memberController.addTask)

Router.route("/:memberId/editTask/:taskId").put(memberController.editTask)

Router.route("/:memberId/deleteTask/:taskId").delete(memberController.deleteTask )

Router.route("/changeHead").post(JWT.verify, memberController.changeHead);

Router.route("/hr").post(JWT.verify, memberController.controlHR);

Router.route("/joinCourse").post(JWT.verify,memberController.joinCourse)

Router.route("/getMembersJoinedCourse/:courseId").get(memberController.getMembersJoinedCourse)


Router.route("/submitTask").post(JWT.verify,memberController.submitTask)

Router.route("/verifyOTP").post(otp.verifyOtp);

Router.route("/changePass").post(memberController.changePass);


Router.route("/rate").post(JWT.verify, memberController.rate);

Router.route("/changeProfileImage").post(
    upload.single("image"),
    async (req, res, next) => {
        try {
            if (!req.file) {

                return res.status(400).send('No file uploaded.');
            } else {
                console.log("  file is received")
            }

            // Upload image to Cloudinary using the utility function
            const filePath = __dirname + '../public/' + req.file.path;
            console.log(filePath);

            const imageUrl = await uploadToCloud(filePath); // Passing the file path to Cloudinary
            req.imageUrl = imageUrl;
            console.log("uploaded to cloudinary");

            next()
            //     res.status(200).json({
            //         message: 'Image uploaded successfully!',
            //         url: imageUrl, // Cloudinary URL of the uploaded image
            //     });
        } catch (error) {
            res.status(500).json({ message: 'Error uploading image', error: error.message });
        }
    }, memberController.changeProfileImage
)
module.exports = Router;
