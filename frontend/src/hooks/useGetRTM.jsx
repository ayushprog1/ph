import { setMessages } from "@/redux/chatSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetRTM = () => {
    const dispatch = useDispatch();
    const {socket} = useSelector(store=>store.socketio);
    const {messages} = useSelector(store=>store.chat);
    useEffect(() => {
        socket?.on('new message',(newMessage) =>{
            //console.log(newMessage.message);
            dispatch(setMessages([...messages,newMessage.message]))
        })

        return() =>{
            socket?.off('new message');
        }
    }, [messages,setMessages]);
};

export default useGetRTM;