import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
    //reciverId:[{type:mongoose.Schema.Types.ObjectId, ref:'user'}], 
    groupId:{type:mongoose.Schema.Types.ObjectId,ref:'Group'},
    postId:{type:mongoose.Schema.Types.ObjectId, ref:'Post', required:true},
    message:{
        type: { type: String, enum: ['text', 'image'], required: true },
        content: { type: String ,required:true } 
    },
    createdAt: { type: Date, default: Date.now }
});
export const Message = mongoose.model('Message', messageSchema);