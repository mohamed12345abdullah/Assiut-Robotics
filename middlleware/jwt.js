const jwt = require('jsonwebtoken');
const createError=require("../utils/createError")
const httpStatusText=require("../utils/httpStatusText")
const asyncWrapper=require("../middlleware/asyncWrapper")
const fs=require("fs")
const path = require('path');

const generateToken = async (payload, rememberMe) => {

    try {
  
        const token = await jwt.sign(payload, process.env.SECRET, { expiresIn: rememberMe || "10h" });
        return token;
      

    } catch (error) {
        return createError(error.message,httpStatusText.FAIL,400);
    }
}


const verify =
    async (req, res, next) => {
    try {
        

        console.log("verify");
        
        const authHeader = req.headers["Authorization"] ||  req.headers["authorization"];
        const token= req.params.token||authHeader.split(" ") [1];
        console.log("token: ",token);
        if (!token) {
            throw(createError("token is required",httpStatusText.FAIL,400))

            // res.status(401).send({ message: "token is required" });
        } else {
            const decoded = await jwt.verify(token, process.env.SECRET);
            if (decoded) {
                console.log("decoded is : ", decoded);
                req.decoded = decoded;
                next();
            } else {
                throw(createError(403,httpStatusText.FAIL,"invalid token !"))
                // res.status(401).send({ message: "unauthorized" })
            }
        }
    } catch (error) {
        const file_Path = path.join(__dirname, '../public/error.html');

        const html_Content=fs.readFileSync(file_Path,"utf-8");
        res.status(201).end(html_Content.replace("{{error_message}}",error.message));
    
    }

}

module.exports = {
    generateToken,
    verify
}