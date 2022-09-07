import { Link } from "react-router-dom"
export const ThankYou = () => {
    return (
        <div className='container-fluid p-0 '>
            <div className='row align-items-center text-center justify-content-between p-0 m-0 SignUp-form'>


                <div className='col-lg-8 text-left mx-auto my-4 '>
                    <div className="col-md-8 m-auto bg-white px-md-3 rounded">
                        <div className='text-center py-5'>
                            <h3 className='font-weight-bold display-4 text-success'>Thank You ! </h3>
                            <h5> Your Account is Verified Now</h5>
                            Please  <Link to="/login">
                                Login Now
                            </Link>  !
                        </div>
                    </div>
                </div>
            </div>



        </div>
    )
}