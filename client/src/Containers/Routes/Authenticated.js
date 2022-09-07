import React from "react"
import { Routes, Route} from "react-router-dom"
import { PaymentPlans } from "../Pages/PaymentPlan/PaymentPlans"
import { ContactUs } from "../Pages/ContactUs"
import { Profile } from "../Pages/User/Profile"
import {Dashboard} from "../Pages/User/Dashboard"
import { AllAccessSites, AllSites } from "../Pages/AccessTool/AllSites"
import { GetScript } from "../Pages/AccessTool/GetScript"
import { AllSessions, AllTrafficSites } from "../Pages/TrafficMonitor/AllSites"
import Replay from "../Pages/TrafficMonitor/Replay"
import { AddNewAccessSite } from "../Pages/AccessTool/AddNew"
import { AddNewTrafficSite } from "../Pages/TrafficMonitor/AddNew"
import { TrafficStates } from "../Pages/TrafficMonitor/TrafficStats/TrafficStats"



// const Dashboard = React.lazy(()=> import("../Pages/User/Dashboard"));


export const AuthenticatedRoutes = ()=>{
    return(
        <Routes>
            <Route path="/" element={<Dashboard/>}></Route>
            <Route path="/dashboard" element={<Dashboard/>}></Route>
            <Route path='/addNewAccess' element={<AddNewAccessSite/>}></Route>
            <Route path='/addNewTraffic' element={<AddNewTrafficSite/>}></Route>
            <Route path='/allAccessSites' element={<AllAccessSites/>}></Route>
            <Route path='/allTrafficSites' element={<AllTrafficSites/>}></Route>
            <Route path='/trafficStats' element={<TrafficStates/>}></Route>
            <Route path='/replay' element={<Replay/>}></Route>
            
            <Route path='/replay' element={<Replay/>}></Route>
            <Route path='/paymentplans' exact element={<PaymentPlans/>}></Route>
            <Route path='/profile' exact element={<Profile/>}></Route>
            <Route path="/contactus"exact element={<ContactUs/>}></Route>
            <Route path='/getscript/:domainName' exact element={<GetScript/>}></Route>
            <Route path='/paymentplans/:domain' exact element={<PaymentPlans/>}></Route>
            <Route path='*' element={<Dashboard/>}></Route>
        </Routes>
    )
}