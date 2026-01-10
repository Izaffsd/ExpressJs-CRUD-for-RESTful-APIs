export const response = (statusCode, data, message, res, errorCode = null, metadata = null) => {
    // func status ( http code ) dari express = Network -> Headers 
    const resBody = {
        success: statusCode < 400, // check conditon true or false
        payload: data,
        message,
        statusCode,
    }
    if(metadata) resBody.metadata = metadata
    if(errorCode) resBody.errorCode = errorCode
    
    return res.status(statusCode).json(resBody)
}


// res.json(statusCode, [ ... ])
// res.json() tak terima status code

// statusCode dianggap sebagai data

// HTTP response tetap 200 OK


// // Status code tak boleh kawal
// const response = (statusCode, data, message, res) => {
//     // func status ( http code ) dari express = Network -> Headers 
//     res.json([
//         {
//             payload: {
//                 // statusCodes: statusCode,
//                 data,
//                 message,
//             },
//             metadata: {
//                 prev: "",
//                 next: "",
//                 current: ""
//             },
//         }
//     ])
//     // res.send(statusCode, message)
// }




// const response = (message, statusCode, res) => {
//     res.json(message, [
//         {
//         statusCode: statusCode,
//         }
//     ]
//     )
// }
// export default response