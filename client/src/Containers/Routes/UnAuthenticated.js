import { Routes, Route} from "react-router-dom"
import { Login } from "../Pages/Authentication/Login/Login"
import { SignUp } from "../Pages/Authentication/SignUp/SignUp"
import { ThankYou } from "../Pages/Authentication/SignUp/ThankYou"
import { Verify } from "../Pages/Authentication/SignUp/Verify"

export const UnAuthenticatedRoutes = ()=>{
    return(

    <Routes>
        <Route path='/' element={<Login/>}></Route>
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/signup' element={<SignUp/>}></Route>
        <Route path='/thankyou' element={<ThankYou/>}></Route>

        <Route path='/verify/:id' element={<Verify/>}></Route>
        <Route path='*' element={<Login/>}></Route>
    </Routes>
    )
}
