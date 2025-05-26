import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Link, useOutletContext } from 'react-router-dom'
import { Button } from './ui/button'
import { useSelector } from 'react-redux'
import useGetAllMessage from '@/hooks/useGetAllMessage'
import useGetRTM from '@/hooks/useGetRTM'

const Messages = () => {
  useGetAllMessage();
  useGetRTM();
  const { messages } = useSelector(store => store.chat);
  const { selectedGroup } = useSelector(store => store.groups);
  const { user, allUsers } = useSelector(store => store.auth);
  const { dark ,isMobile } = useOutletContext();

  let bgclass='';
  if(isMobile){
    if(dark){
      bgclass='';
    }
    else{
      bgclass='';
    }
  }else{
    if(dark){
      bgclass='bg-[#1E1E2E] border-[#282831]';
    }else{
      bgclass='';
    }
  }

  return (
    <>
    <style>{`
        .scrollable {
          overflow-y: auto;
          scrollbar-width: thin; /* Firefox thin scrollbar */
        }

        /* Webkit scrollbar - very thin */
        .scrollable::-webkit-scrollbar {
          width: 4px;
        }

        /* Scrollbar track */
        .scrollable.light::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollable.dark::-webkit-scrollbar-track {
          background: transparent;
        }

        /* Scrollbar thumb */
        .scrollable.light::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
          transition: background-color 0.3s;
        }
        .scrollable.light::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0, 0, 0, 0.4);
        }

        .scrollable.dark::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          transition: background-color 0.3s;
        }
        .scrollable.dark::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.4);
        }

        /* Firefox scrollbar colors */
        .scrollable.light {
          scrollbar-color: rgba(0,0,0,0.2) transparent;
        }
        .scrollable.dark {
          scrollbar-color: rgba(255,255,255,0.2) transparent;
        }
      `}</style>
    <div className={`overflow-y-auto flex-1 p-4 ${bgclass} scrollable ${dark ? 'dark' : 'light'}`}>
      <div className='flex justify-center'>
        <div className={`flex flex-col items-center justify-center ${dark ? 'text-[#979ac2]' : ''}`}>
          <Avatar className="h-20 w-20">
            <AvatarImage src={selectedGroup?.groupprofilepicture} alt='profile' />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <span>{selectedGroup?.Name}</span>
        </div>

      </div>
      <div className='flex flex-col gap-3'>
        {
          messages && messages?.map((msg) => {
            const sender = allUsers?.find(u => u._id === msg.senderId);
            const ownMessage = msg?.senderId === user?._id;
            return (
              <div key={msg._id} className={`flex ${ownMessage ? 'justify-end' : 'justify:start flex-col '}`} >

                <div className='flex '>
                  <div className={`p-2 ml-8 rounded-lg max-w-xs break-words whitespace-pre-wrap ${ownMessage ? 'bg-[#a4e0fc] text-[#7b00ff]' : 'bg-[#353945] text-[#a3e3cbd4]'}`}>
                    {msg?.message?.type === 'text' ? (
                      msg.message.content
                    ) : null}
                  </div>
                </div>
                {!ownMessage && (
                  <div className="flex flex-row items-center gap-2 p-2">
                    <Avatar className="w-5 h-5 mb-1">
                      <AvatarImage src={sender?.profilepicture} alt="img" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <span className={`text-xs  p-1 rounded-xl  backdrop-blur-md ${dark ? 'bg-[#85868779]' : 'bg-white/50  text-gray-600'}`}>{sender?.username}</span>
                  </div>
                )}
              </div>
            )
          })
        }
      </div>
    </div>
    </>
  )
}

export default Messages