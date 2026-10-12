import mongoose, {isValidObjectId}from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.model.js"
import { ApiError } from "../utils/apiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/Cloudinary.js"
import { paginate } from "mongoose-paginate-v2"

const getAllVideos = asyncHandler(async (req, res) => {
    //1. Get input — Extract page, limit, query, sortBy, sortType, and userId from req.query.
    //2.Validate input — Check that page and limit are valid numbers.
    //3. Apply filters — Filter videos by title or other requested criteria.
    //4. Validate filters — Validate userId if provided.
    //5. Apply sorting — Sort by the requested field and direction.
    //6. Apply pagination — Use skip() and limit() to retrieve the requested page.
    //7. Fetch results — Query MongoDB and optionally count matching videos for pagination metadata.
    //8. Return response — Send the videos and relevant pagination information using ApiResponse.

const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

// 1. Validate pagination
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
        throw new ApiError(400, "Invalid page number");
    }

    if (!Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > 100) {
        throw new ApiError(400, "Invalid limit");
    }

    // 2. Build filter
    const filter = {};

    if (query) {
        filter.title = { $regex: query, $options: "i" };
    }

    if (userId) {
        if (!mongoose.isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid user ID");
        }

        filter.owner = userId;
    }

    // 3. Validate sorting
    const allowedSortFields = ["createdAt", "views", "title", "duration"];

    if (!allowedSortFields.includes(sortBy)) {
        throw new ApiError(400, "Invalid sort field");
    }

    let sortDirection;

    if (sortType === "asc" || sortType === "1") {
        sortDirection = 1;
    } else if (sortType === "desc" || sortType === "-1") {
        sortDirection = -1;
    } else {
        throw new ApiError(400, "Invalid sort direction");
    }

    const sortOptions = {
        [sortBy]: sortDirection
    };

    // 4. Calculate pagination
    const skip = (pageNumber - 1) * limitNumber;

    // 5. Fetch videos and count matching documents
    const [videos, totalVideos] = await Promise.all([
        Video.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNumber),

        Video.countDocuments(filter)
    ]);

    // 6. Return response
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                videos,
                pagination: {
                    currentPage: pageNumber,
                    limit: limitNumber,
                    totalVideos,
                    totalPages: Math.ceil(totalVideos / limitNumber)
                }
            },
            "Videos fetched successfully"
        )
    );
});

