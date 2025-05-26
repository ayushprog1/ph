import React, { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2 } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { setAuthUser } from '@/redux/authSlice';
import { toast } from 'sonner';

const EditProfile = () => {
  const imageRef = useRef();
  const { user } = useSelector(store => store.auth);
  const { dark } = useOutletContext();
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState({
    profilephoto: user?.profilepicture,
    about: user?.about,
    gender: user?.gender,
    places: user?.place || [] 
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) setInput({ ...input, profilephoto: file })
  }

  const selectChangeHandler = (value) => {
    setInput({ ...input, gender: value });
  }

  const deletePlaceHandler = (placeToDelete) => {
    setInput((prev) => ({
      ...prev,
      places: prev.places.filter((place) => place !== placeToDelete)
    }));
  };

  const editProfileHandler = async () => {
    const formData = new FormData();
    formData.append("about", input.about);
    formData.append("gender", input.gender);
    formData.append("place", JSON.stringify(input.places));
    if (input.profilephoto) {
      formData.append("profilephoto", input.profilephoto);
    }
    try {
      setLoading(true);
      const res = await axios.post('https://phshare.onrender.com/api/v1/user/profile/edit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      if (res.data.success) {
        const updateduserdata = {
          ...user,
          about: res.data.User?.about,//?? user.bio, // Use existing value if undefined
          gender: res.data.User?.gender,//?? user.gender,
          profilepicture: res.data.User?.profilepicture ,//?? user.profilepicture,
          place:res.data.user?.place,
        };
        dispatch(setAuthUser(updateduserdata));
        navigate(`/profile/${user?._id}`);
        toast.success(res.data.message);
      }

    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className={`flex max-w-2xl mx-auto pl-5 pr-5 ${dark ? 'text-[#d3e1f3] ': ''}`}>
      <section className='flex flex-col gap-6 w-full my-8' >
        <h1 className='font-bold text-xl'>Edit Profile</h1>
        <div className={`flex items-center justify-between  rounded-xl p-4 ${dark ? 'bg-[#131324]' : 'bg-gray-100'}`}>
          <div className='flex items-center gap-2'>
            <Avatar>
              <AvatarImage src={user?.profilepicture} alt="post_image" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>

            <div>
              <h1 className='font-semibold text-sm'>{user?.username}</h1>
              <span className={` text-sm ${dark ? 'text-[#acc0db]' : 'text-gray-600'}`}>{user?.about || "about here ..."}</span>
            </div>
          </div>
          <input ref={imageRef} onChange={fileChangeHandler} type='file' className='hidden' />
          <Button onClick={() => imageRef?.current.click()} className={` h-8  ${dark ? 'bg-[#d3e1f3] text-[#1c1f21] hover:text-[#c1d9c176]' : 'bg-[#0095F6] hover:bg-[#318bc7] hover:text-blue-800'}`}>Change Picture</Button>
        </div>
        <div>
          <h1 className='font-bold text-l' >about</h1>
          <Textarea value={input?.about} onChange={(e) => setInput({ ...input, about: e.target.value })} name='about' className='focus-visible:ring-transparent' />
        </div>
        <div>
          <h1 className='font-bold mb-2 '>Gender</h1>
          <Select defaultValue={input?.gender} className={`${dark ? 'bg-[#34344a]' : ''}`} onValueChange={selectChangeHandler}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={`${dark ? 'bg-[#34344a]' : ''}`}>
              <SelectGroup className={`${dark ? 'bg-[#34344a]' : ''}`}>
                <SelectItem value="male" className={`${dark ? 'text-white' : 'text-black'}`}>Male</SelectItem>
                <SelectItem value="female" className={`${dark ? 'text-white' : 'text-black'}`}>Female</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className='flex flex-col gap-2 my-3'>
          <h1 className='font-bold text-l'>Places</h1>
          <div className='flex items-start flex-wrap gap-2 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none w-full min-h-25'>
            {input.places.map((place, index) => (
              <div key={index} className=' bg-gray-600 text-white text-sm font-medium px-2 py-1 rounded-md '>
                {place}
                <button onClick={() => deletePlaceHandler(place)} className='ml-2 text-black-500 hover:text-red-700'>
                  &times; {/* Cross icon */}
                </button>
              </div>
            ))}
            <input
              type="text"
              placeholder="Enter a new place"
              className="outline-none border-none bg-transparent focus:ring-0 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  const newPlace = e.target.value.trim();
                  if (!input.places.includes(newPlace)) {
                    setInput(prev => ({ ...prev, places: [...prev.places, newPlace] }));
                  }
                  e.target.value = '';
                }
              }}
            />
          </div>
        </div>


        <div className='flex justify-end'>
          {
            loading ? (
              <Button className={`w-fit ${dark ? 'bg-[#d3e1f3] hover:bg-[#8b97a6] text-[#1c1f21] hover:text-[#8cea90]' : 'bg-[#0095F6] hover:bg-[#318bc7]'} `}>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Please wait</Button>
            ) : (<Button onClick={editProfileHandler} className={`w-fit ${dark ? 'bg-[#d3e1f3] hover:bg-[#8b97a6] text-[#1c1f21] hover:text-[#8cea90]' : 'bg-[#0095F6] hover:bg-[#318bc7]'} `}>Submit</Button>)
          }

        </div>
      </section>
    </div>
  )
}

export default EditProfile