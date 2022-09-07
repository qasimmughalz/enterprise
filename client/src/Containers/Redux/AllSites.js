import axios from "axios";
import { errorLoading, setGetAllSites } from "./getAllSites";


export const Sites = () => async dispatch => {
    const getToken = localStorage.getItem('token');
    const email = localStorage.getItem('email')

    await axios({
        method: 'GET',
        url: `http://localhost:5000/api/getSites/${email}`,
        data: {},
        headers: {
            "authorization": `Bearer ${getToken}`
          },
    }).then((res) => {
        dispatch(setGetAllSites(res.data))
    }).catch((e) => {
        dispatch(errorLoading(e.message))
    })
}