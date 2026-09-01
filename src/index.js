import "dotenv/config";
import connectDB from "./db/index.js";

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running at : ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MONGODB connection failed !!!", err);
})






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
