const express = require("express");

const memberController = require("../controller/member.controller");
const JWT = require("../middleware/jwt");
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
// const upload = multer({
//     storage: diskStorage,
//     fileFilter,
// });

const upload = multer({ storage: multer.memoryStorage() });


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



Router.route("/changeHead").post(JWT.verify, memberController.changeHead);

Router.route("/hr").post(JWT.verify, memberController.controlHR);

Router.route("/joinCourse").post(JWT.verify,memberController.joinCourse)

Router.route("/getMembersJoinedCourse/:courseId").get(memberController.getMembersJoinedCourse)


Router.route("/submitTask").post(JWT.verify,memberController.submitTask)

Router.route("/:memberId/tasks/:taskId/submissions/:submissionId")
        .put(memberController.updateTaskEvaluation)

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





// const Member = require("../mongoose.models/member");

Router.route("/:memberId/addTask").post(JWT.verify,memberController.addTask)

Router.route("/:memberId/editTask/:taskId").put(JWT.verify,memberController.editTask)

Router.route("/:memberId/deleteTask/:taskId").delete(JWT.verify,memberController.deleteTask )

Router.post("/members/:memberId/rateTask/:taskId",JWT.verify,memberController.rateMemberTask);


const { google } = require('googleapis');
const stream = require('stream');

// إعداد المصادقة مع Google Drive
const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json', // ملف Service Account
    scopes: ['https://www.googleapis.com/auth/drive.file']
  });
  
  const drive = google.drive({ version: 'v3', auth });

Router.put("/submitMemberTask/:taskId",
    

    upload.single('file'),JWT.verify, async (req, res,next) => {
        try {
          if (!req.file) {
            return next()
          }
      
          const FOLDER_ID = '1-3RpVbXCnwd67h06CLTjTgU0VRUa_dSE'; 

          const fileMetadata = {
            name: req.file.originalname,
            parents: [FOLDER_ID]
          };
      
          const bufferStream = new stream.PassThrough();
          bufferStream.end(req.file.buffer);
      
          const media = {
            mimeType: req.file.mimetype,
            body: bufferStream // الآن هو Stream
          };
      
          const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id'
          });
      
          const fileId = response.data.id;
          const fileUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

          req.fileId=fileId;
          req.fileUrl=fileUrl;
          next()
        //   res.status(200).json({
        //     fileId,
        //     fileUrl,
        //     message: 'تم الرفع بنجاح!'
        //   });
        } catch (error) {
          console.error('❌ خطأ أثناء رفع الملف:', error);
          res.status(500).send(error.message);
        }
      },
    
    
    
    memberController.submitMemberTask);

Router.post("/update-tasks-evaluation", memberController.updateTaskEvaluations);









// استخدام multer مع التخزين في الذاكرة (RAM)
// const upload = multer({ storage: multer.memoryStorage() });

// معرف المجلد في Google Drive
// const FOLDER_ID = '1PiT2qfepsNUBmCGTXVCWv3ZP62aC3G1Y'; // استبدلها بمجلدك

// API لرفع الملفات إلى Google Drive
// app.post('/upload', upload.single('file'), async (req, res) => {
//     try {
//       if (!req.file) {
//         return res.status(400).send('لم يتم رفع أي ملف.');
//       }
  
//       const fileMetadata = {
//         name: req.file.originalname,
//         parents: [FOLDER_ID]
//       };
  
//       const media = {
//         mimeType: req.file.mimetype,
//         body: Buffer.from(req.file.buffer) // استخدام Buffer بدلاً من ReadStream
//       };
  
//       const response = await drive.files.create({
//         resource: fileMetadata,
//         media: media,
//         fields: 'id'
//       });
  
//       const fileId = response.data.id;
//       const fileUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  
//       res.status(200).json({
//         fileId,
//         fileUrl,
//         message: 'تم الرفع بنجاح!'
//       });
//     } catch (error) {
//       console.error('خطأ أثناء رفع الملف:', error);
//       res.status(500).send('حدث خطأ أثناء رفع الملف.');
//     }
//   });

// app.listen(PORT, () => {
//   console.log(`🚀 السيرفر يعمل على http://localhost:${PORT}`);
// });




module.exports = Router;
