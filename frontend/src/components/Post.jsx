import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useDispatch, useSelector } from 'react-redux'
import { FaHeart, FaRegHeart } from "react-icons/fa"
import { Badge, MoreHorizontal } from 'lucide-react';
import axios from 'axios';
import { setPosts, setSelectedPost } from '@/redux/postSlice';
import { toast } from 'sonner';
import { useOutletContext } from 'react-router-dom';

const Post = ({ post }) => {
    const { user } = useSelector(store => store.auth);
    const { posts } = useSelector(store => store.posts);
    const { dark } = useOutletContext();
    const [liked, setLiked] = useState(post?.like?.includes(user?._id) || false);
    const [postLike, setPostLike] = useState(post.like.length);
    const dispatch = useDispatch();
    const { isMobile, setShowChat } = useOutletContext(); // Access the context


    const likeOrDislikeHandler = async () => {
        try {
            const action = liked ? 'dislike' : 'like';
            const res = await axios.get(`http://localhost:8000/api/v1/post/${post._id}/${action}`, { withCredentials: true })
            if (res.data.success) {
                //console.log(res.data);
                const updatedLikes = liked ? postLike - 1 : postLike + 1;
                setPostLike(updatedLikes);
                setLiked(!liked);

                //apne post ko update karunga
                const updatedpostdata = posts.map(p =>
                    p._id == post._id ? {
                        ...p,
                        like: liked ? p.like.filter(id => id !== user._id) : [...p.like, user.Avatar_id]
                    } : p
                );
                dispatch(setPosts(updatedpostdata));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const postClickHandler = (post) => {
        dispatch(setSelectedPost(post));
        if (isMobile) {
            setShowChat(true);
        }
    }

    const deletePostHandler = async () => {
        try {
            const res = await axios.delete(`http://localhost:8000/api/v1/post/delete/${post?._id}`, { withCredentials: true })
            if (res.data.success) {
                const updatedpostdata = posts.filter((postItem) => postItem?._id !== post?._id);
                dispatch(setPosts(updatedpostdata));
                toast.success(res.data.message);

            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    }
    const isuserpost = (user?._id === post.author._id);

    let bgclass ="";
    if(dark){
        if(isuserpost){
            bgclass = 'bg-[#BDBDBD] border-[#665e5e]';
        }
        else{
            bgclass='bg-[#857373] border-[#5f5353]';
        }
    }else{
        if(isuserpost){
            bgclass = 'bg-[#BDBD] border-[]';
        }
        else{
            bgclass='bg-[#4DD01] border-[]';
        }
    }
    return (
        <div className={`my-6 w-full max-w-lg mx-auto  ${bgclass} border-2 rounded-lg overflow-hidden p-4`}>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <Avatar>
                        <AvatarImage src={post?.author?.profilepicture} alt="post_image" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className='flex items-center gap-3'>
                        <h1>{post.author?.username}</h1>
                        {/*
                            user?._id === post.author._id && <Badge variant="secondary">Author</Badge>*/
                        }
                    </div>

                </div>
                <div className='flex flex-row gap-1 hover:text-gray-600'>
                    {
                        liked ? <FaHeart onClick={likeOrDislikeHandler} size={'25px'} className='cursor-pointer text-red-600' /> : <FaRegHeart onClick={likeOrDislikeHandler} size={'25px'} className='cursor-pointer ' />
                    }
                    <span className='font-medium block mb-2'>{postLike}</span>
                </div>
            </div>
            <img onClick={() => { postClickHandler(post) }}
                className='rounded-sm my-2 w-full h-auto object-contain'
                src={post?.image}
                //src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdc3H56581RE-2OwhhIUtP1DmW93YDl4udww&s"
                //src="https://upload.wikimedia.org/wikipedia/en/7/7c/Link_Click_Poster.jpg"
                //src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScGend0e4y-rsEu5NH5PvMrBh1aZEjc081Mg&s"
                alt="post_img"
            />

            <div onClick={() => { postClickHandler(post) }} className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <p>
                        {post.caption}
                    </p>
                </div>
                <MoreHorizontal className='cursor-pointer' />
            </div>
        </div>
    )
}

export default Post