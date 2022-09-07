import { Fragment } from 'react'
import ReactDOM from 'react-dom'
import classes from './Modal.module.css'
import CopyToClipboard from 'react-copy-to-clipboard'
import { useState } from 'react'

export const TheNotifyModal = (props) => {
   
    return (<div className={classes.backdrop} >

        <div className={`${classes.modal} ${classes.card}`}>
            <header className={classes.header}>
                <h2> {props.title} </h2>
            </header>
            <div className={classes.content}>
                <div className={` rounded p-3 text-dark`} >
                    <p className="my-4">
                        <code className="text-dark">{props.message} </code>
                    </p>
                </div>
            </div>
            <footer className={classes.actions} style={{justifyContent:'flex-end'}}>
                <button className='btn btn-primary' onClick={props.onConfirm}>Cancel</button>
            </footer>
        </div>
    </div>
    )
}



export const NotifyModal = (props) => {
    return (<Fragment>
        {ReactDOM.createPortal(<TheNotifyModal title={props.title} message={props.message} onConfirm={props.onConfirm} />, document.getElementById('modal'))}
    </Fragment>

    )
}