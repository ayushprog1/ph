import { setAuthUser, setUserProfile } from "@/redux/authSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector} from "react-redux";

const useGetUserProfile = (userId) => {
    const dispatch = useDispatch();
    const {userProfile} = useSelector(store=>store.auth);
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/api/v1/user/${userId}/profile`, { withCredentials: true });
                if (res.data.success) {
                    //console.log(res.data);
                    dispatch(setUserProfile(res.data.user));
                    dispatch(setAuthUser(res.data.mainuser));
                }

            } catch (error) {
                console.log(error);
            }
        }
        fetchUserProfile();
    }, [userId]);
};

export default useGetUserProfile;