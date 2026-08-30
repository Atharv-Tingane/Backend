import "dotenv/config";
import connectDB from "./db/index.js";

connectDB();

// dotenv.config({
//     path: './.env'
// })

/*
(async()=>{
    try {
      await mongoose.connect(`${process.env.MOGODB_URI}/${DB_NAME}`)
    } catch (error) {
        console.error("ERROR :", error)
        throw error
    }
})()
*/
