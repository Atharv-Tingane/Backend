import mongoose, {Schema} from "mongoose";

const commentsSchema = new Schema({

        content: {
            type: String,
            required: true
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },{timestamps: true})

export const Comments = mongoose.model("Comments", commentsSchema)