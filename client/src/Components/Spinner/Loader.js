import ReactLoading from 'react-loading'


export const Spinner = (props)=> {

    return(<span className='spinner' style={{display:'inline-block'}}>
       <ReactLoading type='spinningBubbles' color={props.color} height={25} width={25} ></ReactLoading>
    </span>)

}