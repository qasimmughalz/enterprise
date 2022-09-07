
import {  useFormik } from 'formik'
import { Link, useNavigate } from 'react-router-dom'
import * as Yup from 'yup'
import axios from 'axios'
import {  useState } from 'react'
import logo from '../../../../assets/images/logo-small.jpg'
import { Spinner } from '../../../../Components/Spinner/Loader'


export const SignUp = () => {

    const navigate = useNavigate();
    const [isLoading,setLoading]= useState(false)
    const [AlreadyEmailAlert, setAlreadyEmailAlert] = useState(false)

    const [anyError, setanyErrorMessage] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const phoneRegExp = /^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,3})|(\(?\d{2,3}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/

    const formik = useFormik({
        initialValues: {
            Name: '',
            Phone: '',
            Email: '',
            Password: '',
            ConfirmPass: ''
        },
        validationSchema: Yup.object({
            Name: Yup.string().max(20, 'Name Should be less than 20 charachers').required('Required'),
            Phone: Yup.string().matches(phoneRegExp, 'Phone number is not valid').required('Required'),
            Email: Yup.string().email().required('Required'),
            Password: Yup.string().min(8, 'Minimum 8 Characters long').required('Required'),
            ConfirmPass: Yup.string().min(8, 'Minimum 8 Characters long').oneOf([Yup.ref('Password')], 'Password did not match').required('Required'),
        }),
        onSubmit: values => {
            setLoading(true)
            axios({ 
                method: 'POST',
                url: 'http://localhost:5000/api/signup',
                data: { name: values.Name, email: values.Email, password: values.Password , phoneNo: +(values.Phone) }
            }).then((res) => {
                if (res.status === 200 && res.data.error) {
                    setLoading(false)
                    setAlreadyEmailAlert(true)
                }
                if (res.status === 201 ){
                    setLoading(false)
                    navigate(`/verify/${res.data.data.userId}`)
                }
                    
            }).catch((e) => {
                setLoading(false)
                setanyErrorMessage(true)
                setErrorMessage(e.message)
            })
        }
    })


    return (<div className='container-fluid p-0 '>
        <div className='row align-items-center text-center justify-content-between p-0 m-0 SignUp-form'>


            <div className='col-lg-8 text-left mx-auto my-4 '>
                <div className="col-md-8 m-auto bg-white px-md-3 rounded">
                    <div className='text-center pt-5'>
                        <img style={{ height: '80px' }} src={logo} alt='logo' className='img-fluid '></img>
                        <h3 className='heading-two'>Create a Free Account</h3>
                    </div>
                   

                    <div className='px-md-3 m-auto text-left my-5' style={{ width: '80%', textAlign: 'left' }}>

                          {/* //===== Error Message Block  ====*/}

                    <div className="alert alert-warning alert-dismissible fade show" role="alert" style={{display: AlreadyEmailAlert ? 'block' : 'none'}}>
                        <strong>Email Already Registered !</strong> Try  <Link to="/login">
                           Login
                        </Link>  ?
                        <button type="button" className="close" data-dismiss="alert" onClick={()=>setAlreadyEmailAlert(!AlreadyEmailAlert)} aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>

                    {/* //========= Error Message ======== */}

                    <div className="alert alert-warning alert-dismissible fade show" role="alert" style={{ display: anyError ? 'block' : 'none' }}>
                            <strong>{errorMessage}</strong> 
                            <button type="button" className="close" onClick={() => setanyErrorMessage(!anyError)} aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>

                      {/* //===== Sign Up Form   ====*/}
                        <form onSubmit={formik.handleSubmit}>
                            <div className='form-group my-3 ' >
                                <label > Name</label>
                                <input type='text'
                                    name='Name'
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.Name} className='form-control' placeholder='Enter the name'></input>
                                {formik.touched.Name && formik.errors.Name ? <p className='text-danger mt-1'>{formik.errors.Name}</p> : null}
                            </div>

                            <div className='form-group'>
                                <label >Phone <span className='text-small pl-2 text-muted'>( +972 55 44X-XXXX  )</span></label>
                                <input type='text' className='form-control'
                                    name='Phone'
                                    placeholder='Enter phone'
                                    value={formik.values.Phone}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}></input>
                                {formik.touched.Phone && formik.errors.Phone ? <p className='text-danger mt-1'>{formik.errors.Phone}</p> : null}
                            </div>

                            <div className='form-group my-3 ' >
                                <label >Email</label>
                                <input type='email'
                                    name='Email'
                                    value={formik.values.Email}
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange} className='form-control' placeholder='Enter email'></input>
                                {formik.touched.Email && formik.errors.Email ? <p className='text-danger mt-1'>{formik.errors.Email}</p> : null}
                            </div>
                            <div className='form-group my-3'>
                                <label >Password</label>
                                <input type='password'
                                    name='Password'
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.Password} className='form-control' placeholder='Enter password'></input>
                                {formik.touched.Password && formik.errors.Password ? <p className='text-danger mt-1'>{formik.errors.Password}</p> : null}
                            </div>
                            <div className='form-group'>
                                <label >Confirm Password</label>
                                <input type='password'
                                    name='ConfirmPass'
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.ConfirmPass} className='form-control' placeholder='Confirm Password'></input>
                                {formik.touched.ConfirmPass && formik.errors.ConfirmPass ? <p className='text-danger mt-1'>{formik.errors.ConfirmPass}</p> : null}
                            </div>

                            <div className='form-group my-3 text-center'>
                                <button className='btn btn-form btn-primary ' type='submit' style={{ width: '100%' }}> {isLoading ? <Spinner/> : `Sign Up`}  </button>
                            </div>
                        </form>
                    </div>  

                      {/* //===== Footer Options  ====*/}

                    <div className='text-center py-4'><p>Already a member ?  <span className='text-danger'>
                        <Link to="/login">
                            Login
                        </Link>
                    </span> </p>
                        <p className='text-muted'>© Copyright 2022 Ngf.co.il</p>
                    </div>
                </div>
            </div>
        </div>



    </div>)
}