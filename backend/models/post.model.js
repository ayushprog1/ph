import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    caption:{type:String, default:''},
    place:{type:String, default:''},
    image:{type:String, required:true},
    author:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    group:{type:mongoose.Schema.Types.ObjectId, ref:'Group', required:true},
    like:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}], 
    comments:[{type:mongoose.Schema.Types.ObjectId, ref:'Comment'}],
    messages:[{type:mongoose.Schema.Types.ObjectId,ref:'Message'}],
});
export const Post = mongoose.model('Post', postSchema);