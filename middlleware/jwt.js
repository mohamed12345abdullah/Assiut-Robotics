const jwt = require('jsonwebtoken');
const createError=require("../utils/createError")
const httpStatusText=require("../utils/httpStatusText")
const asyncWrapper=require("../middlleware/asyncWrapper")

const generateToken = async (payload, rememberMe) => {

    try {
        // if(rememberMe){
        // const token=await jwt.sign(payload, secret,{});
        // console.log("remember me");
        // return token;
        // }else{
        const token = await jwt.sign(payload, process.env.SECRET, { expiresIn: rememberMe || "2h" });
        return token;
        // }

    } catch (error) {
        return createError(error.message,httpStatusText.FAIL,400);
    }
}


const verify = asyncWrapper(
    async (req, res, next) => {
    
        console.log("verify");
        
        const authHeader = req.headers["Authorization"] ||  req.headers["authorization"];
        const token=authHeader.split(" ") [1]|| req.params.token;
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
 

})

module.exports = {
    generateToken,
    verify
}