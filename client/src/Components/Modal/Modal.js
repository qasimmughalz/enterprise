import { Fragment } from 'react'
import ReactDOM from 'react-dom'
import classes from './Modal.module.css'
import CopyToClipboard from 'react-copy-to-clipboard'
import { useState } from 'react'

export const TheModal = (props) => {
    const [copy, setCopy] = useState(false)
     const {domain, script , message}= props.message;


     const showCopiedFunction = ()=>{
        setCopy(true)
        setTimeout(()=>{
            setCopy(false)
        },40000)
     }

    return (<div className={classes.backdrop} >

        <div className={`${classes.modal} ${classes.card}`}>
            <header className={classes.header}>
                <h2> {props.title} </h2>
            </header>
            <div className={classes.content}>
                {domain && <h5>Your script for domain : {domain}</h5>}
                <div className={`${classes.innerScroll} rounded bg-white p-3 text-dark`} >
                    <pre className="my-4">
                        <code className="text-dark">{message ? message : script} </code>
                    </pre>
                </div>
            </div>
            <footer className={classes.actions}>
                {domain && (
                <div>
                <CopyToClipboard text={script} onCopy={showCopiedFunction}>
                 <button className='btn btn-secondary' >Copy to Clipboard</button> 
                </CopyToClipboard>
                {copy && <span className='text-success pl-2'>Copied !</span> }
                </div>
                )}
                
                <button className='btn btn-primary' onClick={props.onConfirm}>Cancel</button>
            </footer>
        </div>
    </div>
    )
}


export const Modal = (props) => {
    return (<Fragment>
        {ReactDOM.createPortal(<TheModal title={props.title} message={props.message} onConfirm={props.onConfirm} />, document.getElementById('modal'))}
    </Fragment>

    )
}