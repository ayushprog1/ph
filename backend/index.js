import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import messageRoutes from "./routes/message.routes.js";
import { app , server} from "./socket/socket.js";
import path from "path";

dotenv.config({});
//const app= express(); //remove after io implementation
const PORT = process.env.PORT || 3000;

const __dirname = path.resolve();

/*app.get("/",(_,res)=>{
    return res.status(200).json({
        message:"I'm coming from backend",
        success:true
    })
})*/
//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({extended:true}));
const corsOptions = {
    origin: process.env.URL,
    //origin: 'http://localhost:5173',
    credentials : true
};
app.use(cors(corsOptions));

app.use("/api/v1/user",userRoutes);
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/message", messageRoutes);

//const PORT =8000;

/*//yha par api use 
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/message", messageRoutes);
*/
app.use(express.static(path.join(__dirname, "/frontend/dist")));
app.get("*",(req,res)=>{
    res.sendFile(path.resolve(__dirname,"frontend","dist","index.html"));
})

server.listen(PORT,()=>{   //app to server convert after io implementation
    connectDB();
    console.log(`server listen at port ${PORT}`);
})
