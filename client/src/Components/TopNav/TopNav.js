import { useDispatch } from "react-redux"
import { TriggerToggle } from "../../Containers/Redux/NavbarToggle"
import { logoutHandler } from "../../Containers/Redux/UserAuth"


export const TopNav = ()=>{

    const dispatch = useDispatch()


    return(<nav className="top-header navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
    <ul className="navbar-nav">
        <div className="topbar-divider d-none d-sm-block"></div>
        <button className="nav-items border-0 bg-white font-weight-bold text-white" onClick={()=> dispatch(logoutHandler())}>
              <span className='text-danger'> Logout </span>
        </button>
    </ul>
    {<button className="toggler-btn btn btn-link rounded-circle mr-1" onClick={()=>dispatch(TriggerToggle()) }>
        <i className="fa fa-bars"></i>
    </button>}
</nav>)
}