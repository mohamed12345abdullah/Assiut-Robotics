const express = require("express");
const componentController = require("../controller/component.controller.js");
const JWT = require("../middleware/jwt.js");
const Router = express.Router();
const multer = require("multer");
const { uploadToCloud } = require("../utils/cloudinary");

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

// Cloudinary image upload route
Router.route("/add").post(
    upload.single("image"),
    async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).send('No file uploaded.');
            }

            // Upload image to Cloudinary using the utility function
            const imageUrl = await uploadToCloud(req.file.path); // Passing the file path to Cloudinary
            req.imageUrl = imageUrl;
            next()
            //     res.status(200).json({
            //         message: 'Image uploaded successfully!',
            //         url: imageUrl, // Cloudinary URL of the uploaded image
            //     });
        } catch (error) {
            res.status(500).json({ message: 'Error uploading image', error });
        }
    },
    componentController.addComponent
);
Router.route("/getComponents").get(componentController.getCombonent);

Router.route("/update").post(componentController.updateComponent);
Router.route("/deleteAll").get(componentController.deleteAll);
Router.route("/deleteOne").post(componentController.deleteOne);

module.exports = Router;
