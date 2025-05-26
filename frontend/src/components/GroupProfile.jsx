import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Table, TableBody, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import axios from 'axios';
import { setGroups, setSelectedGroup } from '@/redux/groupSlice';
import { toast } from 'sonner';

const Profile = () => {
    const params = useParams();
    const groupId = params.id;
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { dark } = useOutletContext();

    const { user } = useSelector(store => store.auth);
    const { groups, selectedGroup } = useSelector(store => store.groups);
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const imageRef = useRef();
    

    const fileChangeHandler = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            editProfileHandler(file);  // Directly pass the file
        }
        e.target.value = null;
    };
    const editProfileHandler = async (file) => {
        const formData = new FormData();
            
        formData.append("groupprofilephoto", file);
        try {
            setLoading(true);
            //console.log(formData);
            const res = await axios.post(`https://phshare.onrender.com/api/v1/user/group/${groupId}/edit`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });
            {/*const ress = await axios.get('http://localhost:8000/api/v1/user/groupaddtokensbulk',{
                withCredentials: true
            });
            console.log(ress.data);*/}

            if (res.data.success) {
                const updatedgroupdata = {
                    ...selectedGroup,
                    groupprofilepicture: res.data.group?.groupprofilepicture,
                };
                dispatch(setSelectedGroup(updatedgroupdata));
                //console.log(res.data);
                const updatedGroups = groups?.map(group =>
                    group._id === updatedgroupdata._id ? updatedgroupdata : group
                );

                dispatch(setGroups(updatedGroups));
                //navigate(`/group/profile/${groupId}`);
                toast.success(res.data.message);
            }

        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    }


    const profileHandler = (profileId) => {
        navigate(`/profile/${profileId}`);
    }

    const [filteredList, setFilteredList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const filtered = group?.people.filter(profile =>
            profile.username.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredList(filtered);

    }, [searchQuery, group?.people]);

    // Fetch group details
    useEffect(() => {
        const fetchGroup = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`https://phshare.onrender.com/api/v1/user/group/${groupId}`, {
                    withCredentials: true,
                });
                //console.log(res.data);
                setGroup(res.data.group);
                setLoading(false);
            } catch (error) {
                console.log(error)
                setLoading(false);
            }
        };

        fetchGroup();
    }, [groupId]);
    //console.log(groupId,group);

    const joinLink = `https://phshare.onrender.com/api/v1/user/join/${group?.joinToken || groupId}`;
    const shareHandler = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join My Group!',
                    text: 'Click the link below to join:',
                    url: joinLink,
                });
            } catch (error) {
                console.error("Sharing failed", error);
            }
        } else {
            toast("Sharing not supported on this device.");
        }
    };

    if (loading) return <p>Loading group info...</p>;

    const isMember = group?.people.some(member => member._id === user._id);


    if (!isMember) {
        return (
            <div className="max-w-3xl mx-auto p-6 text-center">
                <h1 className="text-3xl font-bold mb-4">{group?.Name}</h1>
                <p className="mb-6">You are not a member of this group.</p>
            </div>
        );
    }

    return (
        <div className={`flex max-w-4xl justify-center mx-auto ${dark ? 'text-[#cecdce]' : ''}`}>
            <div className='flex flex-col gap-2 p-8 w-full'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-5 p-4'>
                    <section className='flex flex-col items-center justify-center'>
                        <div className='flex items-center flex-col'>
                            <span className='text-lg font-semibold' >{group?.Name}</span>
                            <div className='flex items-center gap-2 my-2'>
                                <Button variant='secondary' onClick={shareHandler} className={` h-8 ${dark ? 'bg-[#34344a] text-[#9caeba] hover:text-[#453356ed] ' : 'hover:text-gray-200'}`} >Invite Friend</Button>
                            </div>
                        </div>
                    </section>
                    <section className='flex flex-col gap-2 items-center justify-center'>
                        <Avatar className='h-36 w-36'>
                            <AvatarImage src={group?.groupprofilepicture} alt="profile_photo" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <input ref={imageRef} onChange={fileChangeHandler} type='file' className='hidden' />
                        <Button variant='secondary' className={` h-8 ${dark ? 'bg-[#34344a] text-[#9caeba] hover:text-[#453356ed] ' : 'hover:text-gray-200'}`} onClick={() => imageRef?.current.click()} >Change Picture</Button>

                    </section>
                </div>
                <div className='my-2'>
                    <div className={`flex justify-center gap-50 shadow-lg rounded-lg border p-4 px-5 mx-3 ${dark ? 'bg-[#34344a] border-[#29294a]' : 'bg-white border-gray-200'}`}>
                        <p><span className='font-semibold'>{group?.people.length}</span> Members</p>
                        <p><span className='font-semibold'>{group?.posts.length}</span> posts</p>
                    </div>
                    {/*<div className='flex flex-col my-3'>
                        <h3 className='font-semibold'>About the user</h3>
                        <span className='bg-white shadow-lg rounded-lg border border-gray-200 min-h-25 p-1' >{group?.about || 'about the group...'}</span>

                    </div>*/}
                </div>
                <div className={`flex flex-col  shadow-lg rounded-lg border  p-4 px-5 mx-3 ${dark ? 'bg-[#34344a] border-[#29294a]' : 'bg-white border-gray-200'}`}>
                    <h3 className='font-semibold'>Members</h3>
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
                        <Table className="w-full border-collapse  ">
                            <TableHeader>
                                <TableRow >
                                    <th className=" text-left">
                                    </th>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredList?.map(profile => (
                                    <TableRow key={profile._id} onClick={() => profileHandler(profile._id)} className='border-0' >
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


            </div>
        </div>
    )

}

export default Profile