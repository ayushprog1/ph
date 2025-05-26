import mongoose, { mongo } from "mongoose";

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log('connection with mongoose successfully.')
    }catch(error){
        console.log(error)
    }
}

export default connectDB;