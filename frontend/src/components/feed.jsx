import React, { useState } from 'react'
import Posts from './posts'
import { PlusSquare } from 'lucide-react'
import { CgInsertAfterR } from "react-icons/cg";
import CreatePost from './Createpost';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useSelector } from 'react-redux';
import { Button } from './ui/button';
import { useNavigate, useOutletContext } from 'react-router-dom';

const Feed = () => {
  const { selectedGroup } = useSelector(store => store.groups);
  const [open, setopen] = useState(false);
  const { isMobile ,dark} = useOutletContext(); // Access the context
  const navigate = useNavigate();
  const groupProfileHandler = (groupId) => {
    navigate(`/group/profile/${groupId}`);
  }


  const createPosthandler = () => {
    setopen(true);
  }

  return (
    <div className={`flex-1 flex flex-col items-center ${dark ? 'bg-[#1E1E2E] border-[#05050f]' : ''}  rounded border  `}>
      <div className={`flex items-center ${dark ? 'bg-[#34344a] border-[#131324]' : '' } w-full rounded border  gap-3 p-3 justify-between ${isMobile ? 'sticky top-15 z-10' : 'sticky top-0 z-10'} `} >
        <Avatar onClick={() => groupProfileHandler(selectedGroup?._id)}>
          <AvatarImage src={selectedGroup?.groupprofilepicture} alt="img" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <span onClick={() => groupProfileHandler(selectedGroup?._id)} className={`text-md ${dark ? 'text-[#cecdce]' : ''}`}>{selectedGroup?.Name}</span>
        <Button onClick={() => { createPosthandler() }} className={`flex items-center gap-1  ml-auto ${dark ? 'bg-[#d3e1f3] text-[#1c1f21] hover:text-[#b5cab569]' : 'hover:text-blue-800'}`}>
          <CgInsertAfterR className='size-5' />
          <span className='text-md'>create pic</span>
        </Button>

      </div>
      <div className='w-full'>
        <Posts />
      </div>
      <CreatePost open={open} setOpen={setopen} />
    </div>
  )
}

export default Feed