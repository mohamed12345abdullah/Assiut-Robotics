module.exports=(statusCode,statusText,message)=>{
    const error=new Error();
    error.message=message;
    error.statusCode=statusCode;
    error.statusText=statusText;

    return error;
}