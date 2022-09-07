
import ReactLoading from 'react-loading'


export const FullScreenSpinner = () => {

    return (
        <div style={{ backgroundColor: 'red', height: '100vh' }}>
            <div className='spinner m-auto' style={{ display: 'inline-block' }}>
                <ReactLoading type='spinningBubbles' color='#ffffff' height={25} width={25} ></ReactLoading>
            </div>
        </div>)

}