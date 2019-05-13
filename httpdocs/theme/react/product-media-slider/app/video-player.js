import React, { useState, useRef } from 'react';
import { Player } from 'video-react';
import { play } from 'video-react/lib/actions/player';

function VideoPlayerWrapper(props){

    const playerEl = useRef(null)
    const [ source, setSource ] = useState();

    console.log(playerEl.getState())
    
    React.useEffect(() => { convertStringToUrl(); }, [props.source])
    React.useEffect(() => { console.log(playerEl)},[playerEl])
    
    function convertStringToUrl(){
        let newSource = props.source.replace(/%2F/g,'/').replace(/%3A/g,':');
        setSource(newSource);
    }

    let videoPlayerDisplay;
    if (source){
        videoPlayerDisplay = (
            <Player
                ref={playerEl}
                height={props.height}
                width={props.width}
                playsInline
                src={source}
            />            
        )
    }

    return (
        <div className="react-player-container">
            {videoPlayerDisplay}
        </div>
    )
}

export default VideoPlayerWrapper;