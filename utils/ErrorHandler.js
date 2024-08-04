function ErrorHandler(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;

    Error.captureStackTrace(error, ErrorHandler);

    return error;
}

module.exports = ErrorHandler;


// class ErrorHandler extends Error{
//     constructor(message,statusCode){
//         super(message);
//         this.statusCode = statusCode

//         Error.captureStackTrace(this,this.constructor);

//     }
    
// }
// module.exports = ErrorHandler

// class ApiError extends Error {
//     constructor(
//         statusCode,
//         message= "Something went wrong",
//         errors = [],
//         stack = ""
//     ){
//         super(message)
//         this.statusCode = statusCode
//         this.data = null
//         this.message = message
//         this.success = false;
//         this.errors = errors

//         if (stack) {
//             this.stack = stack
//         } else{
//             Error.captureStackTrace(this, this.constructor)
//         }

//     }
// }

// export {ApiError}