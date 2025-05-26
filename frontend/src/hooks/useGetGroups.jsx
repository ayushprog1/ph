import { setGroups } from "@/redux/groupSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetGroups = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await axios.get('https://phshare.onrender.com/api/v1/user/groups', { withCredentials: true });
                if (res.data.success) {
                    //console.log(res.data);
                    dispatch(setGroups(res.data.groups));
                }

            } catch (error) {
                console.log(error);
            }
        }
        fetchGroups();
    }, []);
};

export default useGetGroups;