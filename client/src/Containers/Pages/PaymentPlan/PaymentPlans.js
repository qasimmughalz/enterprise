
import axios from "axios"
import { useEffect, useState } from "react"
import { Sidebar } from "../../Layout/Sidebar/Sidebar"
import { TopNav } from "../../../Components/TopNav/TopNav"
import { useDispatch, useSelector } from "react-redux"
import './PaymentPlan.css'
import cardImage from '../../../assets/images/card.svg'
import { Spinner } from "../../../Components/Spinner/Loader"
import { useNavigate, useParams } from "react-router-dom"
import { isAllOf } from "@reduxjs/toolkit"
import { Sites } from "../../Redux/AllSites"

export const PaymentPlans = () => {


    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [isLoading, setIsLoading] = useState(false)
    const [payDomain , setPayDomain]= useState('')
    const navbarShow = useSelector(state => state.navbarToggle.show)
    const allSites = useSelector(state => state.getAllsites.sites)
   
    const [paymentPlans, setPaymentPlans] = useState([])
    const [anyError, setanyErrorMessage] = useState(false)

    const getToken= localStorage.getItem('token')


    useEffect(()=> {
        dispatch(Sites());
    },[])

    useEffect(() => {
        
        const fetchData = async () => {
            setIsLoading(true)
            await axios({
                method: 'GET',
                url: `http://localhost:5000/api/getPlans`,
                data: {},
                headers: {
                    "authorization": `Bearer ${getToken}`
                },
            }).then((res) => {
                setIsLoading(false)
                setPaymentPlans(res.data)
            }).catch((e) => {
                setIsLoading(false)
            })
        }
        fetchData()
    }, [])

   

    const onclickHandler = (id) => {
        const email = localStorage.getItem('email')
        const getToken = localStorage.getItem('token')
        console.log("This is in paydomain", payDomain)





        if (payDomain === null || payDomain === '') {
            setanyErrorMessage(true)
            return
        } else {
            setanyErrorMessage(false)
            const apiCall = async () => {
                const response = await axios({
                    method: 'POST',
                    url: 'http://localhost:5000/api/createSession',
                    data: { email: email, priceId: id, domainName: payDomain , feature:'PLUGIN_ANALYTICS_COMBO' },
                    headers: {
                        "authorization": `Bearer ${getToken}`
                    }
                }).then((res) => {
                    window.location.replace(res.data)
                }).catch(e => {
                })
            }
            apiCall()
        }
    }

    const handleSelectedDomain = (domain)=>{
        setPayDomain(domain)
    }

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

                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <h1 className="h3 mb-0 text-gray-800">Pricing Plans</h1>
                                    <div>
                                        <label className="mr-2">Domain: </label>
                                        <select className="custom-select w-auto" placeholder={payDomain != null ? payDomain : 'Please Select Domain'} onChange={(e)=> handleSelectedDomain(e.target.value)} >
                                            <option value="" >Please Select domain</option>
                                            {allSites && allSites.map((res)=>{
                                            return  <option value={res.domain}>{res.domain}</option>
                                            })}
                                        </select>
                                    </div>
                                </div>

                            {/* //========= Error Message ======== */}

                            <div className="alert alert-warning alert-dismissible fade show" role="alert" style={{ display: anyError ? 'block' : 'none' }}>
                                <strong>Please Select Existing Domain  </strong>
                                <button type="button" className="close" onClick={() => setanyErrorMessage(!anyError)} aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>


                            <div className="row justify-content-center">

                                {paymentPlans.length > 0 ? (
                                    <div className="col-lg-3 col-md-6 col-9 mb-3" key={paymentPlans[0].id}>
                                        <div className="card py-4  h-100">
                                            <div className="card-body d-flex flex-column">
                                                <div className="text-center">
                                                    <img src={cardImage} className="img-fluid  mb-5" alt="Websearch" style={{ height: '100px' }} />
                                                </div>
                                                <div className="card-title  mb-4 text-center fs-2">{paymentPlans[0].name}</div>
                                                <div className="text-center mt-auto mb-4">
                                                    <span className="font-weight-bold fs-2 card-price">${paymentPlans[0].price}</span>/{paymentPlans[0].interval}
                                                </div>

                                                <div className="text-center"><button type="submit" onClick={() => onclickHandler(paymentPlans[0].id)} value='submit' className="btn btn-primary">Choose Plan</button></div>
                                            </div>
                                        </div>
                                    </div>
                                ) : <Spinner color='#1f38fa'></Spinner>
                                }

                            </div>
                        </div>
                        {/* =============== Inner Section End ============= */}
                    </div>
                </div>
            </div>
        </div>


    )
}