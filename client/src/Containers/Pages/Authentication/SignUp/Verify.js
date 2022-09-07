
import { useFormik } from 'formik'
import { Link, useNavigate, useParams } from 'react-router-dom'
import logo from '../../../../assets/images/logo-small.jpg'
import { Spinner } from '../../../../Components/Spinner/Loader'
import { useState } from 'react'
import '../registration.css'
import * as Yup from 'yup'
import axios from 'axios'





export const Verify = () => {

    const [isLoading, setLoading] = useState(false)
    const [anyError, setanyErrorMessage] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')


    const navigate = useNavigate()

    const param = useParams();

    const formik = useFormik({
        initialValues: {
            verifyCode: ''
        },
        validationSchema: Yup.object({
            verifyCode: Yup.string().required('Required'),
        }),
        onSubmit: values => {
            setLoading(true)
            axios({
                method: 'POST',
                url: 'http://localhost:5000/api/verifyOTP',
                data: { userId: param.id, otp: values.verifyCode }
            }).then((res) => {
                setLoading(false)
                setanyErrorMessage(true)
                setErrorMessage(res.data.message)
                setTimeout(() => {
                    navigate('/login')
                }, 4000); 
            }).catch((e) => {
                setLoading(false)
                setanyErrorMessage(true)
                setErrorMessage(e.response.data.error)
            })
        }
    })


    return (<div className='container-fluid p-0 '>
        <div className='row align-items-center text-center justify-content-between p-0 m-0 SignUp-form'>


            <div className='col-lg-8 text-left mx-auto my-4 '>
                <div className="col-md-8 m-auto bg-white px-md-3 rounded">
                    <div className='text-center pt-5'>
                        <img style={{ height: '80px' }} src={logo} alt='logo' className='img-fluid '></img>
                        <h3 className='heading-two mt-2'>Verification Code Sent !</h3>
                    </div>

                    <div className='px-md-3 m-auto text-left my-5' style={{ width: '80%', textAlign: 'left' }}>


                        {/* //========= Error Message ======== */}

                        <div className="alert alert-warning alert-dismissible fade show" role="alert" style={{ display: anyError ? 'block' : 'none' }}>
                            <strong>{errorMessage}</strong>
                            <button type="button" className="close" onClick={() => setanyErrorMessage(!anyError)} aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>

                        {/* //========= Login  Form  ======== */}

                        <form onSubmit={formik.handleSubmit}>

                            <div className='form-group my-3 ' >
                                <label >Please enter the verification code sent to the email you entered ! </label>
                                <input type='text'
                                    name='verifyCode'
                                    value={formik.values.verifyCode}
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange} className='form-control' placeholder='Enter the code below'></input>
                                {formik.touched.verifyCode && formik.errors.verifyCode ? <p className='text-danger mt-1'>{formik.errors.verifyCode}</p> : null}
                            </div>
                            <div className='form-group my-3 text-center'>
                                <button className='btn btn-form btn-primary ' type='submit' style={{ width: '100%' }}> {isLoading ? <Spinner /> : 'Verify'}</button>
                            </div>
                        </form>
                    </div>

                      {/* //===== Footer Options  ====*/}

                    <div className='text-center py-4'><p>Did not get code ? <span className='text-danger'> Contact Us.
                    </span> </p>
                        <p><Link to='/signup'>
                            Back To Home Page
                        </Link>
                        </p>
                        <p className='text-muted'>© Copyright 2022 Ngf.co.il</p>
                    </div>
                </div>
            </div>
        </div>

    </div>)
}