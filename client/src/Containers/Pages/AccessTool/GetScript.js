import {  useSelector } from "react-redux"
import { TopNav } from "../../../Components/TopNav/TopNav"
import { Sidebar } from "../../Layout/Sidebar/Sidebar"
import sample from '../../../assets/images/example.PNG'
import { Link,  useParams } from "react-router-dom"
export const GetScript = () => {

    const navbarShow = useSelector(state => state.navbarToggle.show)
    const userEmail = localStorage.getItem('email')

   
    const params = useParams()
    

    const obj = `<!-- Accessibility Code for "${params.domainName}" --> <script> window.interdeal = { "sitekey": "a02ed6d4784f2af01462cea69461238d", "userId": "12345678", "Menulang": "EN", "domains": { "js": "https://cdn.equalweb.com/", "acc": "https://access.equalweb.com/" }, "btnStyle": { "vPosition": [ "80%", null ], "scale": [ "0.8", "0.8" ], "icon": { "type": 7, "shape": "semicircle", "outline": false } } }; (function(doc, head, body){ var coreCall = doc.createElement('script'); coreCall.src = 'https://iqasimmughal.com/test.js'; coreCall.defer = true; coreCall.integrity = 'sha512-73oZhkzO+7F1r8AXT5BtChHyVvx8GMuB3Pokx6jdnP5Lw7xyBUO4L5KKi7BwqovhoqOWjNmkah1iCiMniyt6Kw=='; coreCall.crossOrigin = 'anonymous'; coreCall.setAttribute('data-cfasync', true ); body? body.appendChild(coreCall) : head.appendChild(coreCall); })(document, document.head, document.body); </script>`


    let outerCircle = document.createElement('div');
    outerCircle.style.backgroundColor='red';

    outerCircle.style.position='absolute';
    outerCircle.style.bottom='10%';
    outerCircle.style.left='10%';
    outerCircle.style.height='50px';
    outerCircle.style.width='50px';
    outerCircle.style.borderRadius='50%';


    let inner = document.createElement('p')
    inner.style.display = 'flex';
    inner.style.alignItems= 'center';

    outerCircle.append(inner)

    document.body.append(outerCircle)


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
                                    <div>
                                        <h1 className="h3 mb-0 text-gray-800">Your Code for is here.</h1>
                                        <br></br>
                                        <p>Please add this code in the <span className="font-weight-bold">&lt;head&gt;</span> or <span className="font-weight-bold">&lt;script&gt;</span>  section of your Website.</p>
                                    </div>

                                </div>

                               

                                <div className="rounded bg-white p-3  text-dark"  >
                                    <pre className="py-5">
                                        <code className="text-dark">{obj}</code>
                                    </pre>
                                </div>
                                <div className='col-md-4 m-auto my-3 text-center '>
                                        <Link to='/paymentplans'>
                                        <button className='btn btn-form btn-primary my-4' value='submit' type='submit' style={{ width: '100%' }}> Pay Now  </button>
                                        </Link>
                                </div>
                            </div>


                            <div className="col-md-4 text-center mt-5">
                                <p>Widget Page Display Example </p>

                                <p className="my-3" >{params.domainName === '' ? 'example' : params.domainName}</p>
                                <img src={sample} alt="Sample" />
                            </div>
                        </div>

                    </div>

                    {/* =============== Inner Section End ============= */}
                </div>
            </div>
        </div>
    </div>)
}