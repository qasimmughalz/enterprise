import { useEffect , useMemo} from "react"
import { useDispatch, useSelector } from "react-redux"
import { Spinner } from "../../../../Components/Spinner/Loader"
import { TopNav } from "../../../../Components/TopNav/TopNav"
import { Sidebar } from "../../../Layout/Sidebar/Sidebar"
import { Sites } from "../../../Redux/AllSites"
import axios from "axios"
import { Modal } from "../../../../Components/Modal/Modal"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Chart  ,Title , Tooltip, LineElement, Legend, CategoryScale, LinearScale, PointElement} from "chart.js"
import { Line } from 'react-chartjs-2'
import { useRef } from "react"
import classes from './trafficStats.module.css'
import { VideoModal } from "../../../../Components/Modal/VideoModal"
import { MapModel } from "../../../../Components/Modal/MapModal"



Chart.register(Title, Tooltip, LineElement, Legend , CategoryScale, LinearScale, PointElement )

export const TrafficStates = () => {

    const selectedDomain = useRef()
    const dispatch = useDispatch();
    const navigate = useNavigate()

    const navbarShow = useSelector(state => state.navbarToggle.show)
    const allSites = useSelector(state => state.getAllsites.sites)


    const [record, setRecord] = useState([])
    const [VideoEvents, setVideoEvents] = useState([])
    const [isLoading, setisLoading]= useState(false)
    const [ShowModal, setShowModal] = useState(false)
    const [ShowMapModel, setShowMapModel] = useState(false)

    const getToken = localStorage.getItem('token')
    const user = localStorage.getItem('email')

    const FilterTrafficSties = allSites.filter((res)=> res.feature === 'PLUGIN_ANALYTICS_COMBO')


    useEffect(()=> {
        dispatch(Sites());
    },[])

    useEffect(()=> {
            console.log("Selected Domain is", selectedDomain.current)
    },[selectedDomain])

    // const ShowScript = (userId, sitekey)=>{
    //     setisLoading(true)
    //     const RunTheTask = async () => {
    //         const resp = await axios({
    //             method: 'POST',
    //             url: `https://plugin-nodejs-server.herokuapp.com/api/getEvents`,
    //             data: {userId: '62a210133dee6af1b5e167df', siteKey: '63022d199286e63e57dd0cdf'},
    //             headers: {
    //                 "authorization": `Bearer ${getToken}`
    //               },
    //         }).then((res) => {
    //           setisLoading(false)
    //         }).catch((e) => {
    //           setisLoading(false)
    //             console.log("Error", e)
    //         })
    //     }
    //     RunTheTask()
    // }   

    const labels = ['JAN', 'FEB', 'MAR', 'APR', 'MAY','JUNE','JULY','AUG', 'SEP','OCT','NOV','DEC']
    const data = {
        labels: labels,
        datasets: [{
          label: 'Visitors Stats',
          data: [0, 3, 0, 5, 2, 15, 24,15,16,17,14,18],
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      };



      const handleSelectedDomain = (e)=>{
        console.log("check selected", e)
        setisLoading(true)

        const bringRecord = async () => {
            const resp = await axios({
                method: 'POST',
                url: `http://localhost:5000/api/getEvents`,
                data: {email: user, domainName: e},
            }).then((res) => {
                console.log("Response getting EVENTS =====",res)
                setisLoading(false)
                setRecord(res.data.events)
            }).catch((e) => {
                console.log("Error", e)
                setRecord([])
                setisLoading(false)
            })
        }
        bringRecord()
      }



      const showVideo= ()=>{
        setShowModal(true)
      }
      const showMapModel= ()=>{
        setShowMapModel(true)
      } 

      const handleConfirm = ()=>{
        setShowModal(false)
        setShowMapModel(false)
    }

    const showEventsVideo = (data)=>{
        setVideoEvents(data)
        console.log("Video Events state =")
        setShowModal(true)
    }

    return (<div className="wrapper">
        <div className="dashboard-wrapper">
            <div className={navbarShow ? 'sidebar px-md-3' : 'sidebar show px-md-3'} >
                <Sidebar> </Sidebar>
            </div>
            <div className="right-content">
                <div className="content">
                    <TopNav />
                    {/* =============== Inner Section Start ============= */}

                    {ShowModal && <VideoModal title='map' events={VideoEvents} cancel={handleConfirm}></VideoModal>}
                    {ShowMapModel && <MapModel title='map' cancel={handleConfirm}></MapModel>}

                    <div className="container-fluid mb-5 ">
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <h1 className="h3 mb-0 text-gray-800">Traffic Stats</h1>
                            <div>
                                <label className="mr-2">Domain: </label>
                                  <select className="custom-select w-auto" placeholder="please select domain name" onChange={(e)=> handleSelectedDomain(e.target.value)} >
                                    <option value="" >Please Select domain</option>
                                    {FilterTrafficSties && FilterTrafficSties.map((res)=>{
                                      return  <option value={res.domain}>{res.domain}</option>
                                    })}
                                  </select>
                            </div>
                        </div>
                        {record.length == 0 ? (<div className="text-center my-4">
                        <p> No Results </p>
                        </div>
                        ):(
                                <div className={classes.graph} >
                                    <Line data={data}></Line>
                                </div>
                        )}
                        {isLoading ? (<div className="text-center my-4">
                        <Spinner color='#2285b6'></Spinner>
                        </div>
                        ):''}
                        {record.length == 0 ? (<div className="text-center my-4">
                        <p> No Results </p>
                        </div>
                        ):(
                            <div className="row">
                            <div className="col-xl-3 col-md-6 my-4">
                            <div className="card  h-100 py-2">
                                <div className="card-body">
                                <div className="row no-gutters align-items-center">
                                    <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                                        Total Visitors
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {record && record.length}
                                    </div>
                                    </div>
                                    <div className="col-auto">
                                    <i className="fas fa-calendar fa-2x text-success">
                                    </i>
                                    </div>
                                </div>
                                </div>
                            </div>
                            </div>
                        </div>
                        )}
                        {isLoading ? (<div className="text-center my-4">
                        <Spinner color='#2285b6'></Spinner>
                        </div>
                        ):''}
                                
                        <div className="table-responsive sites-table bg-white mt-1">
                            <table className={`${classes.table} table text-center`}>
                                <thead>
                                    <tr>
                                        <th scope="col">IP Address</th>
                                        <th scope="col">TimeZone</th>
                                        <th scope="col">Clicks</th>
                                        <th scope="col">First Click</th>
                                        <th scope="col">Last Click</th>
                                        <th scope="col">Keypress</th>
                                        <th scope="col">Mouse </th>
                                        <th scope="col">Scroll</th>
                                        <th scope="col">Area</th>
                                        <th scope="col">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {record && (record.map((data)=>{
                                    return (<tr scope='row'>
                                    <td>{data.ipAddress}</td>
                                    <td>{data.timezone}</td>
                                    <td>{data.totalClicks}</td>
                                    <td> 
                                        <p className="m-0 text-muted">{data.firstClick && data.firstClick.split('T')[0]}</p> 
                                        <p className="m-0">{data.firstClick && data.firstClick?.split('T')[1].split('.')[0]}</p> 
                                    </td>
                                    <td>
                                        <p className="m-0 text-muted">{data.lastClick && data.lastClick.split('T')[0]}</p> 
                                        <p className="m-0">{data.lastClick && data.lastClick.split('T')[1].split('.')[0]}</p> 
                                    </td>
                                    <td>{data.totalkeyPress}</td>
                                    <td>{data.totalMouseMove}</td>
                                    <td>{data.totalScroll}</td>
                                    <td><i className="fas fa-map-marker-alt text-primary pointer" ></i></td>
                                    {data.totalClicks > 0 ?  <td ><i className="fas fa-video text-primary pointer" onClick={()=> showEventsVideo(data.sessionEvents)}></i></td> : <td></td> }
                                   
                                </tr>)
                                })) }
                                    
                                </tbody>
                            </table>
                        </div>

                        {record.length == 0 ? (<div className="text-center my-4">
                        <p> No Results </p>
                        </div>
                        ):''}

                        {isLoading ? (<div className="text-center my-4">
                        <Spinner color='#2285b6'></Spinner>
                        </div>
                        ):''}

                        <div className="my-5 "></div>
                    </div>

                    {/* =============== Inner Section End ============= */}
                </div>
            </div>
        </div>
    </div>
    )
}