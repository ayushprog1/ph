import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader } from './ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button';
import { useSelector } from 'react-redux';
import { Table, TableBody, TableHead, TableHeader, TableRow } from './ui/table';
import axios from 'axios';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const CreateGroup = ({ open, setOpen, dark }) => {
  const { user, allUsers } = useSelector(store => store.auth);
  const [groupname, setGroupName] = useState("");
  //const [list, setList] = useState([]);
  const [loading, setloading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredList, setFilteredList] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([user?._id]);

  const createGroupHandler = async (e) => {
    e.preventDefault();

    const groupData = {
      Name: groupname,
      people: selectedUsers
    };
    //console.log(groupData);
    try {
      setloading(true);
      const res = await axios.post('https://phshare.onrender.com/api/v1/user/creategroup', groupData, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      if (res.data.success) {
        //dispatch(setPosts([res.data.post , ...posts])); //[1]->[1,2]
        toast.success(res.data.message);
        setOpen(false);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
    finally {
      setloading(false);
    }
  };

  /*useEffect(() => {
    const getAllUsers = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/v1/user/users', { withCredentials: true });
        if (res.data.success) {
          //setList(res.data.users);
          //console.log(res.data);
        }
      } catch (error) {
        console.log(error);
        toast(error);
      }
    };
    getAllUsers();
    //console.log(list);
  }, []);*/

  //setList(allUsers);

  useEffect(() => {
    const friendUsers = allUsers.filter(person =>
      user.friends.some(friend => {
        const friendId = typeof friend === 'string' ? friend : friend._id;
        return person._id === friendId;
      })
    );

    const filtered = friendUsers.filter(profile =>
      profile?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredList(filtered);

  }, [searchQuery, user?.friends , allUsers]);

  //console.log(filteredList);

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prevSelected => {
      const newSelected = prevSelected.includes(userId)
        ? prevSelected.filter(id => id !== userId)
        : [...prevSelected, userId];
      //console.log("Updated Selected Users:", newSelected); // Log the updated state
      return newSelected;
    });
  };

  return (
    <div>
      <Dialog open={open}>
        <DialogContent onInteractOutside={() => setOpen(false)} className={`max-h-[80vh] overflow-y-auto ${dark ? 'bg-[#1E1E2E] border-[#0c0c2b] text-[#cecdce]' : ''}`}>
          <DialogHeader className="text-center font-semibold">create a group</DialogHeader>
          <div className="flex gap-3 items-center">
            <Avatar>
              <AvatarImage src={user?.profilepicture} alt="img" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <h1 className='font-semibold text-xs'>{user?.username}</h1>
            </div>

          </div>
          <input
            type="text"
            value={groupname}
            onChange={(e) => setGroupName(e.target.value)}
            className={`shadow-lg rounded w-full text-sm p-1 focus-visible:ring-transparent border ${dark ? 'bg-[#0b0b14] border-[#2132] hover:border-[#47325db1]' : 'border-gray-300'}`}
            placeholder="Write a group name..."
          />
          <br></br>
          <div className={`p-1 border border-black-300 rounded shadow-md focus-visible:ring-transparent ${dark ? 'text-sm bg-[#0b0b14] border-[#2132] hover:border-[#47325db1]' : 'border-gray-300'}`}>
            <div className="mb-2"> {/* Separate container for the search bar */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className={`shadow-lg rounded w-full p-2 focus-visible:ring-transparent border ${dark ? 'text-sm bg-[#0b0b14] border-[#2132] hover:border-[#47325db1]' : 'border-gray-300'}`}

              />
            </div>

            <div className={`p-1 border  rounded shadow-md max-h-[300px] overflow-y-auto ${dark ? 'border-[#11112e] ' : 'border-black-300'}`}>
              <Table className="w-full border-collapse  ">
                <TableHeader>
                  <TableRow >
                    <th className=" text-left">

                    </th>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredList?.length > 0 ?
                    (filteredList?.map(profile => (
                      <TableRow key={profile?._id} onClick={() => toggleUserSelection(profile?._id)} className={`border-0 ${dark ? 'text-[#9caeba] hover:bg-[#b9def6] hover:text-[#c07efeed]' : ''}`} >
                        <td className={selectedUsers.includes(profile._id) ? 'p-2 flex item-center border-0 text-[#c79eeded] bg-[#6d9dbe]' : 'p-2 flex item-center'}>
                          <Avatar>
                            <AvatarImage src={profile?.profilepicture} alt="img" />
                            <AvatarFallback>CN</AvatarFallback>
                          </Avatar>
                          <span className='p-1'>{profile.username}</span>
                        </td>
                      </TableRow>
                    ))) : (<span>No friends to add</span>)}
                </TableBody>

              </Table>
            </div>
          </div>
          <div className="mt-4">
            <h2 className="font-semibold">Selected Users:</h2>
            <div className={`max-h-[200px] overflow-y-auto border  rounded shadow-lg focus-visible:ring-transparent  ${dark ? 'bg-[#0b0b14] border-[#2132]':'border-gray-300'}`}>
              <ul>

                {selectedUsers?.map(userId => {
                  const selectedUser = allUsers?.find(profile => profile?._id === userId);
                  return (
                    <li key={userId} className="p-2 border-0">
                      {selectedUser ? selectedUser?.username : (userId === user?._id ? user?.username : 'User  not found')}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {
            loading ? (
              <Button>
                <Loader2 className={`mr-2 h-2 w-4 animate-spin ${dark ? 'bg-[#7e8997] text-[#1c1f21] hover:text-[#b3b7ee]' : 'bg-[#0095F6] hover:bg-[#258bcf]'}`} />
                Please wait
              </Button>
            ) : (
              <Button onClick={createGroupHandler} type='submit' className={`w-full ${dark ? 'bg-[#7e8997] text-[#1c1f21] hover:text-[#b3b7ee]' : 'bg-[#0095F6] hover:bg-[#258bcf]'}`}>Create</Button>
            )
          }

        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CreateGroup

