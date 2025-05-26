import { createSlice } from "@reduxjs/toolkit";

const groupSlice = createSlice({
    name:"groups",
    initialState:{
        onlineUsers:[],
        groups:[],
        selectedGroup:null,
    },
    reducers:{
        //actions
        setOnlineUsers:(state,action) => {
            state.onlineUsers = action.payload;
        },
        setGroups:(state,action) =>{
            state.groups = action.payload;
        },
        setSelectedGroup:(state,action) =>{
            state.selectedGroup = action.payload;
        }
    }
})

export const {setOnlineUsers,setGroups,setSelectedGroup} = groupSlice.actions;
export default groupSlice.reducer;