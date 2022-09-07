import { configureStore } from '@reduxjs/toolkit'
import getAllSites from './getAllSites'
import CounterReducer from './getAllSites'
import NavbarToggle from './NavbarToggle'
import UserAuth from './UserAuth'

export const Store = configureStore({
    reducer: {
        counter : CounterReducer, 
        navbarToggle : NavbarToggle , 
        UserAuth : UserAuth, 
        getAllsites : getAllSites
    }
})