import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name:"auth",
    initialState:{
        user:null,
        userProfile:null,
        allUsers:[],
    },
    reducers:{
        //action
        setAuthUser:(state,action) =>{
            state.user = action.payload;
        },
        setUserProfile:(state,action)=>{
            state.userProfile=action.payload;
        },
        setAllUsers:(state,action) =>{
            state.allUsers=action.payload;
        },
    }

});
export const {setAuthUser ,setUserProfile , setAllUsers} =authSlice.actions;
export default authSlice.reducer;