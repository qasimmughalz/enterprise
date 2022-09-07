import axios from "axios";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./App.css";
import { logoutHandler, settingInitialValues } from "./Containers/Redux/UserAuth";
import { AuthenticatedRoutes } from "./Containers/Routes/Authenticated";
import { UnAuthenticatedRoutes } from "./Containers/Routes/UnAuthenticated";
import { Buffer } from "buffer";
import { useEffect } from "react";
import { Suspense } from "react";
import { Spinner } from "./Components/Spinner/Loader";


function App() {

  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false)
  let userFound = useSelector((state) => state.UserAuth.isLoggedIn);
  let reduxToken = useSelector((state) => state.UserAuth.token);
  const token = localStorage.getItem("token");


//  function isTokenExpired(token) {
//     const payloadBase64 = token.split(".")[1];
//     const decodedJson = Buffer.from(payloadBase64, "base64").toString();
//     const decoded = JSON.parse(decodedJson);
//     const exp = decoded.exp;
//     const expired = Date.now() >= exp * 1000;
//     return expired;
//   }

  const ValidateToken = async (currToken) => {
   
    const resp = await axios({
      method: "POST",
      url: "http://localhost:5000/api/login",
      headers: {
        authorization: `Bearer ${currToken}`,
      },
    })
      .then((res) => {
        setIsLoading(false)
        console.log("Logged In")

        const checkExpiry = true;
        if(checkExpiry){
          console.log("Time not expired")
          dispatch(settingInitialValues({ userToken:token , userLoggedIn :true}))
        }else{
          console.log("Time expired")
          dispatch(logoutHandler())
        }
      })
      .catch((er) => {
        console.log("Error in Validation", er)
        dispatch(logoutHandler());
      });
  };

    if (!token) {
      dispatch(logoutHandler);
    } else {
      ValidateToken(token);
    }



  return (
    <Suspense fallback={<Spinner color='#2285b6'/>}>
    <div className="App">
      {userFound ? <AuthenticatedRoutes /> : <UnAuthenticatedRoutes />}
    </div>
    </Suspense>
  );
}

export default App;
