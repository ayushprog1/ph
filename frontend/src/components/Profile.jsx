import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { AtSign, Badge, Heart, MessageCircle } from 'lucide-react';
import useGetUserProfile from '@/hooks/useGetUserProfile';
import { Table, TableBody, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import axios from 'axios';
import { setAuthUser, setUserProfile } from '@/redux/authSlice';

const Profile = () => {
    const params = useParams();
    const userId = params.id;
    useGetUserProfile(userId);
    const dispatch = useDispatch();
    const { dark } = useOutletContext();

    const { userProfile, user, allUsers } = useSelector(store => store.auth);
    //console.log(userProfile);
    const navigate = useNavigate();

    const isloginuser = user?._id === userProfile?._id;
    const isfriend = user?.friends?.includes(userProfile?._id);
    const isSendRequested = userProfile?.friendRequests?.includes(user?._id);
    const isGetRequested = user?.friendRequests?.includes(userProfile?._id);

    //console.log(isGetRequested,isSendRequested,isfriend);
    const profileHandler = (profileId) => {
        navigate(`/profile/${profileId}`);
    }

    const [filteredList, setFilteredList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const filtered = allUsers.filter(profile =>
            profile.username.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredList(filtered);

    }, [searchQuery, allUsers]);

    const sendRequestHandler = async() =>{
        try {
            const res = await axios.get(`https://phshare.onrender.com/api/v1/user/request/${userProfile?._id}`, { 
                withCredentials: true 
            });
            //console.log(res.data);
            if(res.data.success){
                dispatch(setUserProfile(res.data.receiver));
                
            }
            
        } catch (error) {
            console.log(error);
        }
    }

    const acceptFriendHandler = async() => {
        try {
            const res = await axios.get(`https://phshare.onrender.com/api/v1/user/accept/${userProfile?._id}`, { 
                withCredentials: true 
            });
            if(res.data.success){
                dispatch(setAuthUser(res.data.reciever));
                dispatch(setUserProfile(res.data.sender));
            }

            
        } catch (error) {
            console.log(error);
        }
    }

    const removeFriendHandler = async() => {
        try {
            const res = await axios.get(`https://phshare.onrender.com/api/v1/user/remove/${userProfile?._id}`, { 
                withCredentials: true 
            });
            if(res.data.success){
                console.log(res.data);
                dispatch(setAuthUser(res.data.user));
                dispatch(setUserProfile(res.data.friend));
            }
        } catch (error) {
            console.log(error);
        }
    }




    return (
        <div className={`flex max-w-4xl justify-center mx-auto ${dark ? 'text-[#cecdce]' : ''} `}>
            <div className='flex flex-col gap-2 p-8 w-full'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-5 p-4'>
                    <section className='flex flex-col items-center justify-center'>
                            <div className='flex items-center flex-col'>
                                <span className='text-lg font-semibold' >{userProfile?.username}</span>
                                <div className='flex items-center gap-2 my-2'>
                                {
                                    isloginuser ? (
                                        <>
                                            <Link to='/account/edit'><Button variant='secondary' className={` h-8 ${dark ? 'bg-[#34344a] text-[#9caeba] hover:text-[#453356ed] ' : 'hover:text-gray-200'}`} >Edit Profile</Button></Link>
                                            <Button variant='secondary' className={` h-8 ${dark ? 'bg-[#34344a] text-[#9caeba] hover:text-[#453356ed] ' : 'hover:text-gray-200'}`} >View Archive</Button>
                                            <Button variant='secondary' className={` h-8 ${dark ? 'bg-[#34344a] text-[#9caeba] hover:text-[#453356ed] ' : 'hover:text-gray-200'}`} >Ad tools</Button>
                                        </>
                                    ) : isfriend ? (
                                            <>
                                                <Button variant='secondary' className={` h-8 ${dark ? 'bg-[#34344a] text-[#9caeba] hover:text-[#453356ed] ' : ''}`} onClick={()=>{removeFriendHandler()}} >Remove</Button>
                                                <Button variant='secondary' className={` h-8 ${dark ? 'bg-[#34344a] text-[#9caeba] hover:text-[#453356ed] ' : ''}`} >Message</Button>
                                            </>
                                    ) : isSendRequested ? (
                                            
                                            <Button className={`h-8 ${dark ? 'bg-[#bc0cf6] hover:bg-[#d78bfa]' :'bg-[#f10044] hover:bg-[#f7858b] ' }`} onClick={()=>sendRequestHandler()} >Requested</Button>

                                    ) : isGetRequested ? (  
                                         
                                            <Button className={`h-8 ${dark ? 'bg-[#0ca21e] hover:bg-[#92eb9b]' : 'bg-[#02e518] hover:bg-[#92ff9d] '}`} onClick={() => acceptFriendHandler()} >Accept</Button>

                                    ) : (
                                            <Button className={`h-8 ${dark ? 'bg-[#5728ee] hover:bg-[#8aa8f3]' : 'bg-[#512ad3] hover:bg-[#ae88fb] '}`} onClick={()=>sendRequestHandler()} >send Request</Button>

                                    )
                                }
                                </div>
                            </div>
                    </section>
                    <section className='flex items-center justify-center'>
                        <Avatar className='h-36 w-36'>
                            <AvatarImage src={userProfile?.profilepicture} alt="profile_photo" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                    </section>
                </div>
                <div className='my-2'>
                    <div className={`flex items-center justify-between  shadow-lg rounded-lg border  p-4 px-5 ${dark ? 'bg-[#34344a] border-[#29294a]' : 'bg-white border-gray-200'}`}>
                        <p><span className='font-semibold'>{userProfile?.posts.length}</span> posts</p>
                        <p><span className='font-semibold'>{userProfile?.groups.length}</span> groups</p>
                        <p onClick={()=>{friendsHandler()}}><span className='font-semibold'>{userProfile?.friends.length}</span> friends</p>
                        <p><span className='font-semibold'>{userProfile?.place.length}</span> Places</p>
                    </div>
                    <div className='flex flex-col my-3'>
                        <h3 className='font-semibold'>About the user</h3>
                        <span className={` shadow-lg rounded-lg border  min-h-25 p-1 ${dark ? 'bg-[#34344a] border-[#29294a]' : 'bg-white border-gray-200'}`} >{userProfile?.about || 'about user here...'}</span>

                    </div>
                    <div className='flex flex-col my-3'>
                        <h3 className='font-semibold'>places</h3>
                        <div className={` shadow-lg rounded-lg border  min-h-25 p-2 ${dark ? 'bg-[#34344a] border-[#29294a]' : 'bg-white border-gray-200'}`} >
                            {userProfile?.place && userProfile.place.length > 0 ? (
                                <ul className='list-disc list-inside'>
                                    {userProfile.place.map((place, index) => (
                                        <span key={index} className={` text-white-800 text-sm font-semibold mr-2 px-2.5 py-0.5 rounded p-1 ${dark ? 'bg-[#0e0e37]': 'bg-gray-400'}`}>
                                            {place}
                                        </span>
                                    ))}
                                </ul>
                            ) : (
                                <span className='text-gray-500'>Nothing here</span>
                            )}
                        </div>
                    </div>
                </div>
                <div className={` shadow-lg rounded-lg border p-5 gap-2 ${dark ? 'bg-[#34344a] border-[#29294a]' : 'bg-white border-gray-200'}`}>
                    <h3 className='font-semibold'>Add people</h3>
                    <div className="mb-2"> {/* Separate container for the search bar */}
                        <Input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search users..."
                            className={`p-2 border rounded w-full ${dark ? 'border-[#11112e]':''} `}
                        />
                    </div>
                    <div className={`p-1 border  rounded shadow-md max-h-[300px] overflow-y-auto ${dark ? 'border-[#11112e]' : 'border-black-300'}`}>
                        <Table className="w-full border-collapse">
                            <TableHeader >
                                <TableRow >
                                    <th className=" text-left">
                                    </th>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredList.map(profile => (
                                    <TableRow key={profile._id} onClick={() => profileHandler(profile._id)} className='border-0'>
                                        <td className={`p-2 flex item-center ${dark ? 'text-[#9caeba] hover:bg-[#b9def6] hover:text-[#c07efeed]' : ''}`}>
                                            <Avatar>
                                                <AvatarImage src={profile?.profilepicture} alt="img" />
                                                <AvatarFallback>CN</AvatarFallback>
                                            </Avatar>
                                            <span className='p-1'>{profile.username}</span>
                                        </td>
                                    </TableRow>
                                ))}
                            </TableBody>

                        </Table>
                    </div>
                </div>

                {/*
        <div className='border-t border-t-gray-200' >
          <div className='flex items-center justify-center gap-10 text-sm' >
            <span className={`py-3 cursor-pointer ${activeTab === 'posts' ? 'font-bold' : ''}`} onClick={() => handleTabChange('posts')} >POSTS</span>
            <span className='py-3 cursor-pointer'>REELS</span>
            <span className='py-3 cursor-pointer' >TAGS</span>
            <span className={`py-3 cursor-pointer ${activeTab === 'saved' ? 'font-bold' : ''}`} onClick={() => handleTabChange('saved')} >SAVED</span>
          </div>

        </div>
        <div className='grid grid-cols-3 gap-1'>
          {
            displayedPost?.map((post) => {
              return (
                <div key={post?._id} className='relative group cursor-pointer'>
                  <img src={post.image} alt='postimage' className='rounded-sm my-2 w-full aspect-square object-cover' />
                  <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                    <div className='flex items-center text-white space-x-4' >
                      <button className='flex items-center gap-2 hover:text-gray-300'>
                        <Heart />
                        <span>{post?.like.length}</span>
                      </button>
                      <button className='flex items-center gap-2 hover:text-gray-300'>
                        <MessageCircle />
                        <span>{post?.comments.length}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          }
        </div>*/}
            </div>

        </div>
    )
}

export default Profile