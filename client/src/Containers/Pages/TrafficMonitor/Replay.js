import React, { useRef, useEffect } from "react";
import rrwebPlayer from 'rrweb-player';
import "rrweb-player/dist/style.css";
import { TopNav } from "../../../Components/TopNav/TopNav";
import { Sidebar } from "../../Layout/Sidebar/Sidebar";
import { useSelector } from "react-redux";

import events from './myevents.json'



  const Replay = () => {
  const containerRef = useRef();
  const navbarShow = useSelector((state) => state.navbarToggle.show);
  // const GetEvents = useSelector((state) => state.getAllsites.events);
  // const {events} = GetEvents

  useEffect(() => {
    containerRef.current.innerHTML = "";
    const replayer = new rrwebPlayer({
      target: containerRef.current,
      props: {
        events,
        showController: true,
        width: 1000,
        height: 500,
        autoPlay: false,
        mouseTail: false,
        tags: {
          "start-recording": "green",
          "stop-recording": "red"
        }
      }
    });
    return () => {
      replayer.pause();
    };
  }, [containerRef, events]);



  return (
    <div className="wrapper">
      <div className="dashboard-wrapper">
        <div
          className={navbarShow ? "sidebar px-md-3" : "sidebar show px-md-3"}
        >
          <Sidebar> </Sidebar>
        </div>
        <div className="right-content">
          <div className="content">
            <TopNav />
            {/* =============== Inner Section Start ============= */}

            <div className="container-fluid ">
              <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">User Activity</h1>
              </div>
              <div className="playerWraper">
                <div
                  className="playerContainer rr-block"
                  ref={containerRef}
                ></div>
              </div>

              {/* =============== Inner Section End ============= */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Replay;
