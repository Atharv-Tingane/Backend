import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

const registerUser = asyncHandler(async(req , res)=>{
    res.status(200).json({
        message : "Atharv"
    })
    // get user details from frontend
    // validate them - not empty
    // cheak all the fields
    // cheak if the user is already registered or not : by email & username
    // cheak for avatar and images
    // cheak if it is upoaded on cloudinary
    // create user object - create entry in db
    // remove password and refresh tokens field from response
    // cheak for user creation
    // return res
})

export{
    registerUser,
}

