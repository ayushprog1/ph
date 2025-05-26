import { Message } from "../models/message.model.js";
import { Group } from "../models/group.model.js";
import { Post } from "../models/post.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendmessage = async (req, res) => {
    try {
        const senderId = req.id;
        const groupId = req.params.id;
        const postId = req.params.pid;
        const { textMessage: content } = req.body;

        /*let conversation = await Group.findOne({
            participants: { $all: [senderId, receiverId] }
        });
        //establise conversation if not started
        if (!conversation) {
            conversation = await Group.create({
                participants: [senderId, [receiverId]]
            })
        };*/
        //console.log(groupId,postId);

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: "Group not found" });
        }
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const newMessage = await Message.create({
            senderId,
            groupId,
            postId,
            message:{
                type: "text",
                content
            }
        });


        if (newMessage) post.messages.push(newMessage._id);

        await Promise.all([post.save(), newMessage.save()]);

        //const NnewMessage = newMessage.populate({path:'senderId', select: '_id username profilepicture'});

        //implement socket io for real time data transfer
        /*const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit('new message', newMessage);
        }
        */
        group.people.forEach((participantId) => {
            const socketId = getReceiverSocketId(participantId.toString());
            if (socketId && participantId.toString() !== senderId) {
                io.to(socketId).emit("new message", {
                    groupId,
                    postId,
                    message: newMessage
                });
            }
        });

        return res.status(200).json({ success: true, newMessage });
    } catch (error) {
        console.log(error);

    }
};

export const getmessage = async (req, res) => {
    try {
        const senderId = req.id;
        const postId = req.params.id;

        const postconversation = await Post.findById(postId).populate('messages');

        /*const postconversation = await Post.findById(postId).populate({
            path: 'messages',
            select: 'postId senderId message groupId createdAt',
            populate: {
                path: 'senderId', // field in Message schema
                select: '_id username profilepicture',
            },
        });*/

        if (!postconversation) return res.status(200).json({ success: true, messages: [] });

        return res.status(200).json({ success: true, messages: postconversation?.messages });

    } catch (error) {
        console.log(error);

    }
};

export const sendImage = async (req, res) => {
    try {
        const senderId = req.id;
        const image = req.file;
        const group = req.body;

        if (!image) return res.status(401).json({ message: 'image required' });

        //image upload
        const optimizedImageBuffer = await sharp(image.buffer)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();

        //file to datauri
        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
        const cloudResponse = await cloudinary.uploader.upload(fileUri);

        const message = await Message.create({
            group: group,
            message: [{
                type: 'image',
                content: cloudResponse.secure_url
            }

            ],
            senderId: senderId
        });

        await message.populate({ path: 'senderId', select: '-password' });

        return res.status(201).json({
            message: 'New picture message added',
            message,
            success: true
        });

    } catch (error) {
        console.log(error);
    }
}

