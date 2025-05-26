import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import {Post} from "../models/post.model.js";
import {User} from "../models/user.model.js";
import {Comment} from "../models/comment.model.js"; 
import {Group} from "../models/group.model.js";
import { getReceiverSocketId , io } from "../socket/socket.js";

export const addnewpost = async(req,res)=> { 
    try {
        const {caption,place,groupId} = req.body;
        const image = req.file;
        const authorId = req.id;

        if(!image) return res.status(401).json({message:'image required'});

        //groupsselection
        if(groupId==="undefined"){
            return res.status(401).json({
            message:'please select group',
            success:false
        });
        }

        //image upload
        const optimizedImageBuffer= await sharp(image.buffer)
        .resize({width:800,height:800,fit:'inside'})
        .toFormat('jpeg',{quality:80})
        .toBuffer();

        //file to datauri
        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
        const cloudResponse = await cloudinary.uploader.upload(fileUri);
        const post =await Post.create({
            caption,
            place,
            image:cloudResponse.secure_url,
            author:authorId,
            group:groupId,
        });
        const user = await User.findById(authorId);
        if(user){
            user.posts.push(post._id);
            if (!user.place.includes(place)) {
                user.place.push(place); // Add the place if it doesn't exist
            }
            await user.save();
        }

        await post.populate({path:'author',select:'-password'});

        return res.status(201).json({
            message:'New post added',
            post,
            success:true
        });

    } catch (error) {
        console.log(error);
    }
}

export const getAllGroupPost = async(req,res) =>{
    try {
        const groupId = req.params.id;

        //console.log(groupId);
        if (!groupId) {
            return res.status(400).json({
                success: false,
                message: 'groupId is required'
            });
        } 

        const posts = await Post.find({  group: groupId }).sort({createdAt:-1})
        .populate({path:'author', select:'username profilepicture'})
        .populate({
            path:'comments',
            sort:{createdAt:-1},
            populate:{
                path:'author',
                select:'username profilepicture'
            }

        })

        return res.status(200).json({
            posts,
            success:true
        });
    } catch (error) {
        console.log(error);
    }
};

export const getUserPost = async(req,res)=>{
    try {
        const authorId = req.id;
        const posts = await Post.find({author:authorId}).sort({createdAt:-1})
        .populate({path:'author', select:'username profilepicture'})
        .populate({
            path:'comments',
            sort:{createdAt:-1},
            populate:{
                path:'author',
                select:'username profilepicture'
            }

        })

        return res.status(200).json({
            posts,
            success:true
        });
    } catch (error) {
        console.log(error);
    }
};

export const likePost = async(req,res)=>{
    try {
        const likekarnewala = req.id;
        const postid = req.params.id;
        const post = await Post.findById(postid);
        if(!post) return res.status(404).json({message:'post not found',success:false});

        //like logic
        await post.updateOne({ $addToSet : {like:likekarnewala}});
        await post.save();

        //implementation socket io for real time notification
        const group = await Group.findById(post.group).select('Name');
        const user = await User.findById(likekarnewala).select('username profilepicture');
        const postOwnerId = post.author.toString();
        if(postOwnerId!== likekarnewala){
            //emit  a notification event
            const notification ={
                type: 'like',
                userId: likekarnewala,
                userDetails:user,
                postid,
                group,
                message:'your post was liked'
            }
            
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification',notification);
        }

        return res.status(200).json({message:'post liked',success:true});

    } catch (error) {
        console.log(error);
    }
};
export const dislikePost = async(req,res)=>{
    try {
        const dislikekarnewala = req.id;
        const postid = req.params.id;
        const post = await Post.findById(postid);
        if(!post) return res.status(404).json({message:'post not found',success:false});

        //like logic
        await post.updateOne({ $pull : {like :dislikekarnewala}});
        await post.save();

        //implementation socket io for real time notification
        const group = await Group.findById(post.group).select('Name');
        const user = await User.findById(dislikekarnewala).select('username profilepicture');
        const postOwnerId = post.author.toString();
        if(postOwnerId!== dislikekarnewala){
            //emit  a notification event
            const notification ={
                type: 'dislike',
                userId: dislikekarnewala,
                userDetails:user,
                postid,
                group,
                message:'your post was liked'
            }

            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification',notification);
        }

        return res.status(200).json({message:'post Disliked',success:true});

    } catch (error) {
        console.log(error);
    }
};

export const addComment = async(req,res) =>{
    try {
        const postid = req.params.id;
        const commentkarnewala = req.id;

        const {text} = req.body;

        const post = await Post.findById(postid);

        if(!text) return res.status(400).json({message:'text is required' , success:false});

        const comment =await Comment.create({
            text,
            author:commentkarnewala,
            post:postid
        })

        await comment.populate({
            path:'author',
            select:'username  profilepicture'
        });

        post.comments.push(comment._id);
        await post.save();

        return res.status(201).json({
            message:'comment added',
            comment,
            success:true
        });

    } catch (error) {
        console.log(error);
    }
};

export const getcommentsofpost = async(req,res) =>{
    try {
        const postid = req.params.id;

        const comments = await Comment.find({post:postid}).populate('author','username profilepicture');

        if(!comments) return res.status(404).json({message:'no comment found for this post',success:false});

        return res.status(200).json({success:true,comments});
    } catch (error) {
        console.log(error);
        
    }
};

export const deletepost = async(req,res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;

        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:'post not found',success:false});

        //check login user is owner of post 
        if(post.author.toString() !== authorId ) return res.status(403).json({message:'unauthorized'});

        //delete post
        await Post.findByIdAndDelete(postId);

        //delete post from user 
        let user = await User.findById(authorId);
        user.posts = user.posts.filter(id => id.toString() !== postId);
        await user.save();

        let group = await Group.findById(postId);
        group.posts = group.posts.filter(id => id.toString() !== postId);
        await group.save(); 

        
        //delete associated comment
        await Comment.deleteMany({post:postId});

        return res.status(200).json({
            message:'post delete successfully',
            success:true,
        });

    } catch (error) {
        console.log(error);
    }
};
/*
export const bookmarkspost = async(req,res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;

        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:'post not found',success:false});

        const User = await user.findById(authorId);
        if(User.bookmarks.includes(postId)){
            //already bookmarked -> remove from bookmarked
            await User.updateOne({$pull:{bookmarks:post._id}});
            await User.save();
            return res.status(200).json({type:'unsaved',message:'unbookmarked',success:true}); 
        }
        else{
            //bookmarke karna padega
            await User.updateOne({$addToSet:{bookmarks:post._id}});
            await User.save();
            return res.status(200).json({type:'saved',message:'post bookmarked successfully',success:true});
        }
    } catch (error) {
        console.log(error);
    }
};*/