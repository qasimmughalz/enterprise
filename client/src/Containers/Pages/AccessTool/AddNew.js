import { useDispatch, useSelector } from "react-redux"
import { TopNav } from "../../../Components/TopNav/TopNav"
import { Sidebar } from "../../Layout/Sidebar/Sidebar"
import { Spinner } from "../../../Components/Spinner/Loader"
import { useState, useEffect } from "react"
import axios from "axios"
import sample from '../../../assets/images/example.PNG'
import * as Yup from 'yup'
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"


export const AddNewAccessSite = ({traffic=true}) => {

    const [newScript, setNewScript] = useState('')
    const [showScript, setShowScript] = useState(false)
    const navbarShow = useSelector(state => state.navbarToggle.show)
    const userEmail = localStorage.getItem('email')
    const getToken = localStorage.getItem('token')


    const [inputWebsite, setInputWebsite] = useState('')
    const [isLoading, setLoading] = useState(false)
    const [anyError, setanyError] = useState(false)
    const [inputError,setInputError] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')


    const handleSubmit = (e) => {
        e.preventDefault()

        if(inputWebsite === '' || inputWebsite.includes('/') || inputWebsite.includes('http')) {
            if(inputWebsite === ''){
                setanyError(true)
                setErrorMessage('Please Enter Domain Name !')
            }else if(inputWebsite.includes('http')){
                setanyError(true)
                setErrorMessage('Please remove the protocols http/https. Type domain like "www.example.com"')
            }else{
                setanyError(true)
                setErrorMessage('Please remove all / backslashes  !')
            }
            
        }else if (!inputWebsite.includes('www')) {
            setanyError(true)
            setErrorMessage('Incomplete Domain Name !')
            setInputError(true)
        }else{
            const editDomain = inputWebsite.split('.')
            editDomain.shift();
            const FinalDomain = editDomain.join('.')

            setanyError(false)
            setInputError(false)
            setLoading(true);

            axios({
                method: 'POST',
                url: 'https://plugin-nodejs-server.herokuapp.com/api/addNewSite',
                data: { email: userEmail, domain: FinalDomain, language: 'English', platform: 'WordPress', feature:'PLUGIN' },
                headers: {
                    "authorization": `Bearer ${getToken}`
                }
            }).then((res) => {
                setLoading(false);
                if (res.status === 200) {
                    localStorage.setItem('newDomain', inputWebsite)
                    setNewScript(res.data)
                    setShowScript(true)

                }
            }).catch((e) => {
                setLoading(false)
                setanyError(true)
                setErrorMessage(e.response.data.error)
            })
        }
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
                            {!showScript ?
                                (<div className="col-md-8 m-auto">
                                    <div className="d-sm-flex align-items-center justify-content-between mb-4">
                                        <h1 className="h3 mb-0 text-gray-800">Add New Site</h1>
                                    </div>
                                    {/* //========= Error Message ======== */}
                                    <div className="alert alert-warning alert-dismissible fade show" role="alert" style={{ display: anyError ? 'block' : 'none' }}>
                                        <strong>{errorMessage}</strong>
                                        <button type="button" className="close" onClick={() => setanyError(!anyError)} aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                    <div className="col-md-8 m-auto">
                                        <div className="row ">
                                            <form onSubmit={handleSubmit} className='w-100'>
                                                <div className='form-group my-3 ' >
                                                    <label > Insert Your Domain</label>
                                                    <input type='text'
                                                        name='domain'
                                                        onChange={(e) => setInputWebsite(e.target.value)}
                                                        value={inputWebsite} className='form-control' placeholder='www.example.com '></input>
                                                    {inputError ?
                                                <p className='text-danger mt-1'> {`Please add 'www' before Domain Name !`}</p> : null }
                                                </div>
                                                <div className='form-group my-3 text-center'>
                                                    <button className='btn btn-form btn-primary' value='submit' type='submit' style={{ width: '100%' }}> {isLoading ? <Spinner /> : `Add`}  </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>) : (<div className="col-md-8 m-auto">
                                    <div className="d-sm-flex align-items-center justify-content-between mb-4">
                                        <div>
                                            <h1 className="h3 mb-0 text-gray-800">Code for <span className="font-weight-light p-1  text-blue">{inputWebsite}</span> is here.</h1>
                                            <br></br>
                                            <p>Please add this code in the <span className="font-weight-bold">&lt;head&gt;</span> or <span className="font-weight-bold">&lt;script&gt;</span>  section of your Website.</p>
                                        </div>

                                    </div>
                                    <div className="rounded bg-white p-3  text-dark"  >
                                        <pre className="py-5">
                                            <code className="text-dark"> <p> {newScript}</p></code>
                                        </pre>
                                    </div>
                                    <div className='col-md-4 m-auto my-3 text-center '>
                                        <Link to='/paymentplans'>
                                            <button className='btn btn-form btn-primary my-4' value='submit' type='submit' style={{ width: '100%' }}> Pay Now  </button>
                                        </Link>
                                      
                                    </div>
                                </div>)}
                            <div className="col-md-4 text-center mt-5">
                                <p>Widget Page Display Example </p>

                                <p className="my-3" >{inputWebsite === '' ? 'example' : inputWebsite}</p>
                                <img src={sample} alt="Sample" />
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