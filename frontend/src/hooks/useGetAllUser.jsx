import { setAllUsers } from "@/redux/authSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetAllUsers = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        const getAllUsers = async () => {
            try {
                const res = await axios.get('https://phshare.onrender.com/api/v1/user/users', { withCredentials: true });
                if (res.data.success) {
                    dispatch(setAllUsers(res.data.users));
                    //console.log(res.data);
                }
            } catch (error) {
                console.log(error);
                toast(error);
            }
        };
        getAllUsers();
        //console.log(list);
    }, []);

};

export default useGetAllUsers;