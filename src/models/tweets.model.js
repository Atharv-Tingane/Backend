import mongoose, {Schema} from "mongoose";

const tweetsSchema = new Schema({

 content: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps: true})

export const Tweets = mongoose.model("Tweets", tweetsSchema)