import { createSlice } from "@reduxjs/toolkit";


const UserAuth = createSlice({
    name:'userAuth', 
    initialState:  {
        token:'', 
        isLoggedIn:false, 
        Useremail:''
    }, 
    reducers:{
        settingInitialValues:(state , action)=>{
            const { userToken , userLoggedIn } = action.payload;
            state.token = userToken;
            state.isLoggedIn = userLoggedIn
        },
        logoutHandler: (state)=>{
            state.token = '';   
            state.isLoggedIn = false
            state.expireTime = '';
            localStorage.clear()
            console.log("Logout called")
        },
        loginHandler: (state, action)=>{
            const {token } = action.payload
            state.token = token;
            state.isLoggedIn = true
            state.Useremail = localStorage.getItem('email')
            localStorage.setItem('token', token)
            // Token Expire Time 
            // const totalTime = new Date( new Date().getTime() + (+expiresIn * 1000))
            // const currTime = new Date().getTime();
            // const finalTime = totalTime - currTime;
            // setTimeout(()=> logoutHandler  , 3000); 
        }
    }
})

export const {settingInitialValues , loginHandler, logoutHandler } = UserAuth.actions
export default UserAuth.reducer