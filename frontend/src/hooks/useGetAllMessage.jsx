import { setMessages } from "@/redux/chatSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetAllMessage = () => {
    const dispatch = useDispatch();
    const {selectedPost} = useSelector(store=>store.posts);
    const {selectedGroup} = useSelector(store=>store.groups);
    useEffect(() => {
        const fetchAllMessage = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/api/v1/message/all/${selectedPost?._id}`, { withCredentials: true });
                if (res.data.success) {
                    //console.log(res.data);
                    dispatch(setMessages(res.data.messages));
                }

            } catch (error) {
                console.log(error);
            }
        }
        fetchAllMessage();
    }, [selectedPost,selectedGroup]);
};

export default useGetAllMessage;