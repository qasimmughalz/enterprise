
import { useFormik } from 'formik'
import '../registration.css'
import { Link, useNavigate } from 'react-router-dom'
import * as Yup from 'yup'
import axios from 'axios'
import logo from '../../../../assets/images/logo-small.jpg'
import { Spinner } from '../../../../Components/Spinner/Loader'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { loginHandler } from '../../../Redux/UserAuth'
import { Buffer } from 'buffer'


export const Login = () => {

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [isLoading, setLoading] = useState(false)
    const [anyError, setanyErrorMessage] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    // Form Validation and Error Messages

    const formik = useFormik({
        initialValues: {
            Email: '',
            Password: ''
        },
        validationSchema: Yup.object({
            Email: Yup.string().email().required('Required'),
            Password: Yup.string().required('Required'),
        }),
        onSubmit: values => {
            setLoading(true)
            axios({
                method: 'POST',
                url: 'http://localhost:5000/api/authenticate',
                data: { email: values.Email, password: values.Password , returnSecureToken : true }
            }).then((res) => {
                setLoading(false);
                localStorage.setItem('email', values.Email)
                dispatch(loginHandler(res.data))
                navigate('/dashboard')
            }).catch((e) => {
                setLoading(false)
                setanyErrorMessage(true)
                e.response.data == undefined ? setErrorMessage(e.response.data.error) : setErrorMessage(e.message)
            })
        }
    })

    return (<div className='container-fluid p-0 '>
        <div className='row align-items-center text-center justify-content-between p-0 m-0 SignUp-form'>
            <div className='col-lg-8 text-left mx-auto my-4 '>
                <div className="col-md-8 m-auto bg-white px-md-3 rounded">
                    <div className='text-center pt-5'>
                        <img style={{ height: '80px' }} src={logo} alt='logo' className='img-fluid '></img>
                        <h3 className='heading-two'>Login to Your Account</h3>
                    </div>
                    <div className='px-md-3 m-auto text-left my-5' style={{ width: '80%', textAlign: 'left' }}>
                        {/* //========= Error Message ======== */}
                        <div className="alert alert-warning alert-dismissible fade show"
                         role="alert" style={{ display: anyError ? 'block' : 'none' }}>
                            <strong>{errorMessage}</strong> 
                            <button type="button" className="close" onClick={() => setanyErrorMessage(!anyError)} aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>

                        {/* //========= Login  Form  ======== */}

                        <form onSubmit={formik.handleSubmit}>
                            <div className='form-group my-3 ' >
                                <label >Email</label>
                                <input type='email'
                                    name='Email'
                                    value={formik.values.Email}
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange} className='form-control' placeholder='Enter email'></input>
                                {formik.touched.Email && formik.errors.Email ? <p className='text-danger mt-1'>{formik.errors.Email}</p> : null}
                            </div>
                            <div className='form-group'>
                                <label >Password</label>
                                <input type='password'
                                    name='Password'
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.Password} className='form-control' placeholder='Enter password'></input>
                                {formik.touched.Password && formik.errors.Password ? <p className='text-danger mt-1'>{formik.errors.Password}</p> : null}
                            </div>

                            <div className='form-group my-3 text-center'>
                                <button className='btn btn-form btn-primary ' type='submit' style={{ width: '100%' }}> {isLoading ? <Spinner /> : `Log In`} </button>
                            </div>
                        </form>
                    </div>

                    {/* //===== Footer Options  ====*/}

                    <div className='text-center py-4'><p>Not a Member ?  
                        <span className='text-danger'>
                        <Link to='/signup'>
                            Sign Up
                        </Link></span> </p>
                        <p className='text-muted'>© Copyright 2022 Ngf.co.il</p>
                    </div>
                </div>
            </div>
        </div>



    </div>)
}