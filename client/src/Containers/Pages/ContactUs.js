import { useDispatch, useSelector } from "react-redux"
import { TopNav } from "../../Components/TopNav/TopNav"
import { Sidebar } from "../Layout/Sidebar/Sidebar"
import { useFormik } from "formik"
import { Spinner } from "../../Components/Spinner/Loader"
import { useState } from "react"
import axios from "axios"
import * as Yup from 'yup'
import { useNavigate } from "react-router-dom"
import { NotifyModal } from "../../Components/Modal/NotifyModel"


export const ContactUs = () => {

    const navbarShow = useSelector(state => state.navbarToggle.show)
    const userEmail = localStorage.getItem('email')
    const getToken = localStorage.getItem('token')

    const navigate = useNavigate()

    const [isLoading, setLoading] = useState(false)
   
    const [modalShow,setModalShow] = useState(false)
    const [message,setMessage] = useState('')

    const formik = useFormik({
        initialValues: {
            message: '',
        },
        validationSchema: Yup.object({
            message: Yup.string().required('Required'),
        }),
        onSubmit: values => {
            setLoading(true)
            axios({
                method: 'POST',
                url: 'http://localhost:5000/api/contactUs',
                data: { email: userEmail, message: values.message }, 
                headers:{
                    "authorization": `Bearer ${getToken}`  
                }
            }).then((res) => {
                setLoading(false);
                    setMessage('Your Message has been Sent !')
                    setModalShow(true)
            }).catch((e) => {
                setLoading(false)
                setMessage("There was an error sending message, Try Again Later !")
                setModalShow(true)
            })
        }
    })

    const handleConfirm = ()=>{
        setModalShow(false)
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

                    <div className="container-fluid">

                        <div className="row align-items-start">
                            <div className="col-md-8 m-auto">

                                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                                    <h1 className="h3 mb-0 text-gray-800">Contact Us</h1>
                                </div>

                                {/* //========= MOdal  ======== */}

                               {modalShow && <NotifyModal title={'Response'} message={message} onConfirm={handleConfirm}></NotifyModal>}


                                <div className="col-md-8 m-auto">
                                    <div className="row ">
                                            <form onSubmit={formik.handleSubmit} className='w-100'>
                                                <div className='form-group my-3 ' >
                                                    <label > Please enter your message </label>
                                                    <textarea  cols="30" rows="5"
                                                        name='message'
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        value={formik.values.message} className='form-control' placeholder='I would like to discuss about ....'></textarea>
                                                    {formik.touched.message && formik.errors.message ? <p className='text-danger mt-1'>{formik.errors.message}</p> : null}
                                                </div>

                                                <div className='form-group my-3 text-center'>
                                                    <button className='btn btn-form btn-primary' value='submit' type='submit' style={{ width: '100%' }}> {isLoading ? <Spinner /> : `Send Message`}  </button>
                                                </div>
                                            </form>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-4 text-center mt-5">
                              
                            </div>
                        </div>

                    </div>

                    {/* =============== Inner Section End ============= */}
                </div>
            </div>
        </div>
    </div>

    )
}