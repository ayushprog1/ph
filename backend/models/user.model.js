import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{type:String, required:true, unique:true},
    email:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    profilepicture:{type:String, default:''},
    about:{type:String, default:''},
    place:[{type:String, default:''}],
    gender:{type:String, enum:['male','female']},
    friends:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}],
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    groups:[{type:mongoose.Schema.Types.ObjectId, ref:'Group'}],
    posts:[{type:mongoose.Schema.Types.ObjectId, ref:'Post'}],
},{timestamps:true});
export const User = mongoose.model('User',userSchema);