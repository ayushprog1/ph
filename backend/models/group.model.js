import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({ 
    Name:{type:String},
    people:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}],
    joinToken: { type: String, unique: true },
    groupprofilepicture:{type:String, default:''},
    posts:[{type:mongoose.Schema.Types.ObjectId, ref:'Post'}],
    messages:[{type:mongoose.Schema.Types.ObjectId, ref:'Message'}],
},{timestamps:true});
export const Group = mongoose.model('Group',groupSchema); 