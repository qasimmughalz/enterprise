import { createSlice } from "@reduxjs/toolkit";



const NavbarToggle = createSlice({
    name:'navbarToggle', 
    initialState:{
        show:true
    }, 
    reducers:{
        TriggerToggle:(state)=>{
            state.show = !state.show
        }
    }
})

export const {TriggerToggle} = NavbarToggle.actions
export default NavbarToggle.reducer