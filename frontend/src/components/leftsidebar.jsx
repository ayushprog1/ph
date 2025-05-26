import { Heart, HomeIcon, LogOut, MessageCircle, PlusSquare, Search, TrendingUp } from 'lucide-react'
import { CgInsertAfterO } from "react-icons/cg";
import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { setAuthUser } from '@/redux/authSlice'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import CreateGroup from './creategroup'
import { setSelectedGroup } from '@/redux/groupSlice'
import { setSelectedPost } from '@/redux/postSlice'
import { setMessages } from '@/redux/chatSlice'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'
import logo from '../assets/phLogo.png';

const Leftsidebar = ({ isOpen, toggleSidebar, dark, setDark }) => {
  const navigate = useNavigate();
  const { user } = useSelector(store => store.auth);
  const { groups, selectedGroup } = useSelector(store => store.groups);
  const { likeNotification } = useSelector(store => store.realTimeNotification);
  const dispatch = useDispatch();
  const [open, setopen] = useState(false);
  //console.log(groups);


  const logoutHandler = async () => {
    try {
      const res = await axios.get('https://phshare.onrender.com/api/v1/user/logout', { withCredentials: true });
      if (res.data.success) {
        dispatch(setAuthUser(null));
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }

  const createGroupHandler = () => {
    setopen(true);
  }

  const profileHandler = () => {
    navigate(`/profile/${user?._id}`);
  }

  const sidebarHandler = (item) => {
    if (item.text === "Create Group") {
      createGroupHandler();
    } else {
      groupSelectHandler(item.group);
    }
  }

  const groupSelectHandler = (group) => {
    dispatch(setSelectedGroup(group));
    dispatch(setSelectedPost(null));
    dispatch(setMessages([]));
  }
  const groupItems = groups.map(group => ({
    icon: (<div >
      <Avatar className='w-8 h-8'>
        <AvatarImage src={group?.groupprofilepicture} alt="img" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </div>
    ),
    text: group?.Name,
    label: group.Name,
    group
  }));

  const sidebarItems = [
    { icon: <CgInsertAfterO className='size-8' />, text: "Create Group", label: "create Group" },
    ...groupItems,
  ]

  return (
    <div className={`fixed top-0 z-10 left-0 px-4 border-r w-[250px] h-screen ${dark ? 'bg-[#34344a] border-[#2A2A3B] text-[#cecdce]' : 'border-gray-300'}`}>
      {/*<div className='flex flex-col '>*/}
      {/*<button onClick={toggleSidebar} className='mb-4 bg-gray-200 p-2 rounded'></button>*/}
      {/*<h1 onClick={toggleSidebar} className='my-8 pl-3 font-bold text-xl'>LOGO</h1>*/}
      <div className='flex flex-row'>
        <img src={logo} alt="ph" className="w-15 h-15 my-2.5" />
        <h1 onClick={toggleSidebar} className='my-6 pl-3 font-bold text-xl'>ph</h1>
      </div>
      <div onClick={() => profileHandler()} className={`flex item-center gap-3 relative  cursor-pointer rounded-lg p-3 my-3 ${dark ? 'bg-[#424269] hover:bg-[#525275]' : 'bg-gray-200 hover:bg-gray-400'}`}>
        <Avatar className='w-10 h-10'>
          <AvatarImage src={user?.profilepicture} alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <span className='p-2'>{user?.username}</span>
      </div>
      <style>{`
        .scrollable {
          overflow-y: auto;
          height: 65vh;
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
      <div className={`flex flex-col h-[65%] overflow-y-auto  scrollable ${dark ? 'dark' : 'light'}`} style={{
        scrollbarWidth: "none"
      }}
        onMouseEnter={e => e.currentTarget.style.scrollbarWidth = 'thin'}
        onMouseLeave={e => e.currentTarget.style.scrollbarWidth = 'none'}
      >
        {
          sidebarItems.map((item, index) => {
            const match = likeNotification.find((obj) => obj?.group?.Name === item.label);
            //console.log(item);
            return (
              <Link to='/' ><div onClick={() => sidebarHandler(item)} key={index} className={`flex items-center gap-3 relative  cursor-pointer rounded-lg p-3 my-3 ${dark ? 'hover:bg-[#525275]' : 'hover:bg-gray-100'} `}/* {seletedGroup.Name===item.text ? bg-green-200 : }*/>
                {item.icon}
                <span className='p-2'>{item.text}</span>
                {
                  likeNotification.length > 0 && match && (
                    <div className='absolute top-4 right-7'>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button size='icon' className='rounded-full h-5 w-5 absolute bg-red-600 hover:bg-red-600' >{likeNotification.length}</Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <div>
                            {
                              likeNotification.length === 0 ? (<p>No new notification</p>) : (
                                likeNotification.map((notification) => {
                                  return (
                                    <div key={notification.userId} className='flex items-center gap-2 my-2'>
                                      <Avatar>
                                        <AvatarImage src={notification.userDetails?.profilepicture} />
                                        <AvatarFallback>CN</AvatarFallback>
                                      </Avatar>
                                      <p className='text-sm'><span className='font-bold'>{notification.userDetails?.username}</span> liked your post</p>
                                    </div>
                                  )
                                })
                              )
                            }
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )
                }
              </div></Link>
            )
          })
        }
      </div>
      {/*</div>*/}
      <div className={`flex-shrink-0 border-t p-2 ${dark ? 'border-[#141424]' : ''}`}>
        <div onClick={() => logoutHandler()} className={`flex item-center gap-3 relative  cursor-pointer rounded-lg my-3 p-3 ${dark ? 'hover:bg-[#525275]' : 'hover:bg-gray-100'}`}>
          <LogOut />
          <span>Logout</span>
        </div>
      </div>
      <CreateGroup open={open} dark={dark} setDark={setDark} setOpen={setopen} />

    </div>
  )
}


export default Leftsidebar