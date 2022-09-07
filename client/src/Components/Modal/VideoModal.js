import React, { useRef, useEffect  } from "react";
import ReactDOM from 'react-dom'
import { useSelector } from "react-redux";
import rrwebPlayer from 'rrweb-player';
import "rrweb-player/dist/style.css";
import classes from './Modal.module.css'




export const TheVideoModal = (props) => {

    const {events} = props
    const containerRef = useRef();
  

     useEffect(() => {
        containerRef.current.innerHTML = "";
        const replayer = new rrwebPlayer({
          target: containerRef.current,
          props: {
            events,
            showController: true,
            width: 1000,
            height: 400,
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
        
    
      

    return (<div className={classes.backdrop} onClick={props.onConfirm}>
        <div className={`${classes.videomodal} ${classes.card}`}>
            <div className={classes.content}>
                <div className="playerWraper">
                    <div className="playerContainer rr-block" ref={containerRef}>
                </div>
              </div>
            </div>
        </div>
    </div>
    )
}


export const VideoModal = (props)=>{
    return <>
            {ReactDOM.createPortal(<TheVideoModal title={props.title} events={props.events}  onConfirm={props.cancel}></TheVideoModal>, document.getElementById('modal')) }
    </>
}