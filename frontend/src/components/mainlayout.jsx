import React, { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { CgMenuMotion, CgSmartphone } from "react-icons/cg";
import { HiMiniChatBubbleLeftRight } from "react-icons/hi2";
import { ImCool } from "react-icons/im";
import Leftsidebar from './leftsidebar'
import { Button } from './ui/button';
import useGetGroups from '@/hooks/useGetGroups'
import useGetAllGroupPost from '@/hooks/useGetAllGroupPost'
import useGetAllUsers from '@/hooks/useGetAllUser';
import { useSelector } from 'react-redux';

const MainLayout = () => {
  useGetAllUsers();
  useGetAllGroupPost();
  useGetGroups();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showChat, setShowChat] = useState(false);
  const [dark , setDark] = useState(true);
  const { user } = useSelector(store => store.auth);

  const toggleSidebar = () => {
    setIsOpen(prev => !prev);
  };

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  const toggleChat = () => {
    setShowChat(prev => !prev); // Toggle chat visibility
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  return (
    <div className={`flex flex-col h-screen ${dark ? 'bg-[#1E1E2E]' : ''}`}>
      {isMobile && (
        <div className={`fixed top-0 left-0 w-full z-20  p-4 flex items-center justify-between space-x-4 ${dark? 'bg-[#5e5e7a]' : 'bg-gray-400'}`}>
          <Button style={styles.toggleButton} onClick={toggleSidebar} ><CgMenuMotion /></Button>
          <Link to='/' ><Button style={styles.toggleButton} onClick={() => { setShowChat(false); }} ><CgSmartphone /></Button></Link>
          <Link to='/' ><Button style={styles.toggleButton} onClick={toggleChat} ><HiMiniChatBubbleLeftRight /></Button></Link>
          <Link to={`/profile/${user?._id}`} ><Button style={styles.toggleButton} onClick={()=>{setShowChat(false);}} ><ImCool /></Button></Link>
        </div>
      )}
      <div className={`flex ${isMobile?'pt-17':''} ${dark ? 'bg-[#1E1E2E]' : ''}`}>
        <div >
          {(isOpen || !isMobile) && (
            <div className='w-63 bg-gray-100'>
              <Leftsidebar isOpen={isOpen} toggleSidebar={toggleSidebar} dark={dark} setDark={setDark}/>
            </div>
          )}
        </div>
        <div className={`w-full ${dark ? 'bg-[#1E1E2E]' : ''}`}>
          {/*<span>mainlayout</span>*/}
          <Outlet context={{ isMobile, showChat ,setShowChat ,dark,setDark }}/>
        </div>
      </div>
    </div>

  )
}


const styles = {
  toggleButton: {
    backgroundColor: '#444',
    color: 'white',
    border: 'none',
    padding: '10px',
    cursor: 'pointer',
  }

};


export default MainLayout