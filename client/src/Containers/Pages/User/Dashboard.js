import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TopNav } from "../../../Components/TopNav/TopNav";
import { Sidebar } from "../../Layout/Sidebar/Sidebar";
import { Sites } from "../../Redux/AllSites";

 export const Dashboard = () => {
  const navbarShow = useSelector((state) => state.navbarToggle.show);
  const sitesFromRedux = useSelector(state => state.getAllsites.sites)

  const error = useSelector(state => state.getAllsites.error)

  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(Sites())

    // const RunTheTask = async () => {
    //   const resp = await fetch('https://plugin-nodejs-server.herokuapp.com/api/isValidScript', {
    //     method: 'POST',
    //     body: JSON.stringify({ domainName: 'demo.iqasimmughal.com', userId: '62a210133dee6af1b5e167df', siteKey: '62b3e90ab56bcc272c86c40c' }
    //     ),
    //     headers: {
    //       'Content-Type': 'application/json'
    //     }
    //   }).then((res) => res.json())
    //     .then((data) => console.log(data.data.script))
    //     .catch((e) => console.log("Error in Connecting to the API", e))
    // }
    // RunTheTask()


  }, [])

  return (
    <>
      <div className="dashboard-wrapper">
        <div className={navbarShow ? 'sidebar px-md-3' : 'sidebar show px-md-3'} >
          <Sidebar> </Sidebar>
        </div>
        <div className="right-content">
          <div className="content">

            <TopNav />
            {/* =============== Inner Section Start ============= */}


            <div className="container-fluid">
              <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800"> Dashboard </h1>
              </div>
              <div className="row">
                <div className="col-xl-3 col-md-6 mb-4">
                  <div className="card  shadow h-100 py-2">
                    <div className="card-body">
                      <div className="row no-gutters align-items-center">
                        <div className="col mr-2">
                          <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                            Total Sites
                          </div>
                          <div className="h5 mb-0 font-weight-bold text-gray-800">
                            {sitesFromRedux.length}
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
                <div className="col-xl-3 col-md-6 mb-4">
                  <div className="card shadow h-100 py-2">
                    <div className="card-body">
                      <div className="row no-gutters align-items-center">
                        <div className="col mr-2">
                          <div className="text-xs font-weight-bold text-info text-uppercase mb-1">

                            Activations
                          </div>
                          <div className="row no-gutters align-items-center">
                            <div className="col-auto">
                              <div className="h5 mb-0 mr-3 font-weight-bold text-gray-800">
                                3
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-auto">
                          <i className="fas fa-clipboard-list fa-2x text-info">

                          </i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-xl-3 col-md-6 mb-4">
                  <div className="card  shadow h-100 py-2">
                    <div className="card-body">
                      <div className="row no-gutters align-items-center">
                        <div className="col mr-2">
                          <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                            Payments
                          </div>
                          <div className="h5 mb-0 font-weight-bold text-gray-800">

                            Nill
                          </div>
                        </div>
                        <div className="col-auto">
                          <i className="fas fa-dollar-sign fa-2x text-warning">

                          </i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* =============== Inner Section End ============= */}

          </div>
        </div>
      </div>
    </>
  );
};

