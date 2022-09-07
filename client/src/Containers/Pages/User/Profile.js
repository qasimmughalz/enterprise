
import axios from "axios"
import { useEffect, useState } from "react"
import { Sidebar } from "../../Layout/Sidebar/Sidebar"
import { TopNav } from "../../../Components/TopNav/TopNav"
import { useSelector } from "react-redux"
import { Spinner } from "../../../Components/Spinner/Loader"
import { useParams } from "react-router-dom"

export const Profile = () => {

    const currEmail = localStorage.getItem('email')
    const token = localStorage.getItem('token')
    const params = useParams()
    const [isLoading, setIsLoading] = useState(false)
    const navbarShow = useSelector(state => state.navbarToggle.show)
    const [userProfile , setUserProfile] = useState({})

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
             await axios({
                method:'GET',
                url:`http://localhost:5000/api/getUser/${currEmail}`,
                data:{},
                headers:{
                    'authorization':`Bearer ${token}`
                }
            }).then((res) => {
                    setIsLoading(false)
                    setUserProfile(res.data)

                }).catch(error => {
                    setIsLoading(false)
                })
        }
        fetchData()
    }, [])


    return (
        <div className="wrapper">
            <div className="dashboard-wrapper">
                <div className={navbarShow ? 'sidebar px-md-3' : 'sidebar show px-md-3'} >
                    <Sidebar> </Sidebar>
                </div>
                <div className="right-content">
                    <div className="content">

                        <TopNav />
                        {/* =============== Inner Section Start ============= */}

                        <div className="container-fluid mt-5">


                            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                                {/* <h1 className="h3 mb-0 text-gray-800">My Profile</h1> */}
                            </div>
                            <div className="row ml-4 ">

                            {isLoading ? <Spinner color='#1f38fa'></Spinner> : 
                                (<div className="col-md-8  ml-4 ">
                                    <div className="row text-muted">
                                        <div className="col- mx-3">
                                            <i class="fas fa-user fa-9x "></i>
                                        </div>
                                        <div className="col-">
                                            <h5 className="font-weight-bold my-4">   Name : <span className="font-weight-normal ">{userProfile.Name}</span>  </h5>
                                            <h5 className="font-weight-bold my-4">   Email : <span className="font-weight-normal">{userProfile.Email}</span> </h5>
                                            <h5 className="font-weight-bold my-4">   Phone No : <span className="font-weight-normal">{userProfile.PhoneNo}</span> </h5>
                                        </div>
                                    </div>
                                </div>) }
                            </div>
                        </div>
                        {/* =============== Inner Section End ============= */}
                    </div>
                </div>
            </div>
        </div>


    )
}