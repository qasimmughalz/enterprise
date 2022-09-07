import React, { useRef, useEffect  } from "react";
import ReactDOM from 'react-dom'
import "rrweb-player/dist/style.css";
import classes from './Modal.module.css'
import { GoogleMap, Marker, useJsApiLoader} from '@react-google-maps/api'


const containerStyle = {
    width: '400px',
    height: '400px'
  };

  const center = {
    lat: -3.745,
    lng: -38.523
  };

export const TheMapModal = (props) => {

    const [map, setMap] = React.useState(null)

    const onLoad = React.useCallback(function callback(map) {
        const bounds = new window.google.maps.LatLngBounds(center);
        map.fitBounds(bounds);
        setMap(map)
      }, [])
    
      const onUnmount = React.useCallback(function callback(map) {
        setMap(null)
      }, [])
    
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        GoogleMapsApiKey : 'AIzaSyAIp6uipPGDn30rFnLkxlXU9vXMUZyw5GQ'
    })
        
    return (<div className={classes.backdrop} onClick={props.onConfirm}>
        <div className={`${classes.videomodal} ${classes.card}`}>
            <div className={classes.content}>
            {isLoaded ? 
            <GoogleMap zoom={10} center={center} mapContainerClassName={containerStyle} onLoad={onLoad}
            onUnmount={onUnmount}>
                <Marker position={{lat:44 , lng: -80}}></Marker>
            </GoogleMap> 
         : 'Loading'}
            </div>
        </div>
    </div>
    )
}


export const MapModel = (props)=>{
    return <>
            {ReactDOM.createPortal(<TheMapModal title={props.title} onConfirm={props.cancel}></TheMapModal>, document.getElementById('modal')) }
    </>
}