import { setPosts } from "@/redux/postSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetAllPost = () => {
    const {selectedGroup} = useSelector(store=>store.groups);
    const dispatch = useDispatch();
    useEffect(() => {
        const fetchAllPost = async () => {
            try {
                if (!selectedGroup?._id) return; 

                const res = await axios.get(`https://phshare.onrender.com/api/v1/post/${selectedGroup?._id}/all`, { withCredentials: true });
                if (res.data.success) {
                    //console.log(res.data);
                    dispatch(setPosts(res.data.posts));
                }

            } catch (error) {
                console.log(error);
            }
        }
        fetchAllPost();
    }, [selectedGroup]);
};

export default useGetAllPost;