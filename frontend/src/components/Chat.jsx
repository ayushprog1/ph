import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { MessageCircleCode } from 'lucide-react';
import Messages from './Messages';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { setMessages } from '@/redux/chatSlice';
import { setSelectedPost } from '@/redux/postSlice';
import axios from 'axios';

const Chat = () => {
  const { selectedPost } = useSelector(store => store.posts);
  const { selectedGroup } = useSelector(store => store.groups);
  const { messages } = useSelector(store => store.chat);
  const [textMessage, setTextMessage] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isMobile,dark } = useOutletContext(); // Access the context

  const sendMessageHandler = async (groupId, postId) => {
    try {
      //console.log(groupId,postId);
      const res = await axios.post(`http://localhost:8000/api/v1/message/send/${groupId}/${postId}`, { textMessage }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      if (res.data.success) {
        //console.log(res.data);
        dispatch(setMessages([...messages, res.data.newMessage]));
        setTextMessage("");
      }

    } catch (error) {
      console.log(error);
    }
  }

  const groupProfileHandler = (groupId) => {
        navigate(`/group/profile/${groupId}`);
    }

  /*useEffect(()=>{
      return () => {
          dispatch(setSelectedPost(null));
      }
  },[]);*/


  return (
    <div className={`flex ${isMobile ? 'h-full' : 'h-screen'}`}>
      {
        selectedPost ? (
          <section className={`flex-1 border ${dark ? 'border-l-[#0d0d16]' : ''} flex flex-col `}>
            <div className={`flex gap-3 items-center px-3 py-3.5 sticky top-0 border-b rounded ${dark ? 'border-[#292945]  bg-[#34344a]' :'' }`} onClick={() => {groupProfileHandler(selectedGroup?._id)}}>
              <Avatar>
                <AvatarImage src={selectedGroup?.groupprofilepicture} alt='profile' />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className={`flex flex-col ${dark ? 'text-[#cecdce]' : ''}`}>
                <span>{selectedGroup?.Name}</span>
              </div>
              <div className={`${dark ? 'text-[#cecdce]' : ''}`}>
                <span> - {selectedPost?.caption}</span>
              </div>
            </div>
            {isMobile ? (
              <div
                className="flex-1 overflow-auto p-4"
                style={{
                  backgroundImage: selectedPost?.image ? `url('${selectedPost.image}')` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                <Messages />
              </div>
            ) : (
              <Messages />
            )}

            <div className={`flex items-center p-4 border-t   ${dark ? 'bg-[#34344a] border-[#292945]' : ''} `}>
              <Input value={textMessage} onChange={(e) => setTextMessage(e.target.value)} type="text" className={`flex-1 mr-2  ${dark ? 'border-[#0e0e30] text-[#e3a3f3]' : 'focus-visible:ring-transparent'}`} placeholder="message here..." />
              <Button onClick={() => { sendMessageHandler(selectedGroup?._id, selectedPost?._id) }}  >Send</Button>
            </div>

          </section>
        ) : (
          <div className={`flex flex-col items-center justify-center mx-auto w-full ${dark ? 'bg-[#1E1E2E] border-[#1E1E2E] text-[#c5b6a7bb]' : ''} `}>
            <MessageCircleCode className='w-32 h-32 my-4' />
            <h1 className='font-medium text-xl'>Your Messages</h1>
            <span>Select a post to start a chat.</span>
          </div>
        )
      }
    </div>

  )
}

export default Chat