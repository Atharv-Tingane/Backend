import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


const generateAccessAndRefreshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave : false});

        return {accessToken, refreshToken}
        
    } catch (error) {
        throw new ApiError(500,"Refresh and Access tokens error");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // res.status(200).json({
    //     message : "Atharv"
    // })

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
    const { fullName, username, email, password } = req.body;
    console.log("email : ", email);

    // NOW WE HAVE TO CHEAK THAT ARE THE ALL FIELDS EMPTY..?
    // we can also do it one by one by applying if on everyone but we will use array and use some method insted of map

    if ([fullName, username, email, password].some((field) =>
        field?.trim() === "")) {
        throw new ApiError(400, "All fields are compulsary !!!");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with this email and username already exist !");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is not given");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar image is not given");
    }

    const user = await User.create({
        username: username.toLowerCase(),
        password,
        email,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        fullName
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registring the user !");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "USER CREATED SUCCESSFULLY")
    );
})

const loginUser = asyncHandler(async(req, res)=>{
    // req-body - data
    // validate them - should not empty
    // cheak if the user avilable or new
    // password cheak
    // access/refresh token
    // cheak for login
    // send cookies

    const {email, username, password} = req.body;

    if (!username || !email) {
        throw new ApiError(400,"Username or email is required");
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

     if (!user) {
        throw new ApiError(404,"User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

     if (!isPasswordValid) {
        throw new ApiError(401,"Invalid user credentials");
    }

   const {accessToken, refreshToken} =  await generateAccessAndRefreshTokens(user._id);

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
    
})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})


export {
    registerUser,
    loginUser,
    logoutUser
}

