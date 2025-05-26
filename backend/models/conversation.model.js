import mongoose from "mongoose";

const conversationSchema =new mongoose.Schema({
    post:[{type:mongoose.Schema.Types.ObjectId, ref:'Post'}],
    messages:[{type:mongoose.Schema.Types.ObjectId, ref:'Message'}],
});

export const Conversation = mongoose.model('Conversation', conversationSchema);