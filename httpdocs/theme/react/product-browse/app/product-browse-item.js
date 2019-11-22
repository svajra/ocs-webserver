import React, { useState } from 'react';
import { isMobile   } from 'react-device-detect';
import { getImageUrl } from './product-browse-helpers';

export function ProductBrowseItem(props){

    const p = props.product;

    const [ productFilesFetched, setProductFilesFetched ] = useState(false);
    const [ productFiles, setProductFiles ] = useState();
    const [ imgUrl, setImgUrl ] = useState(getImageUrl(p,props.itemWidth,props.imgHeight));


    if (window.location.search === "?index=7") {
        window.browseListType === "favorites";
        browseListType = "favorites";
    }

    React.useEffect(() => {
        if (browseListType === "music"  && productFilesFetched === false ||browseListType ===  "music-test" && productFilesFetched === false) onMusicProductLoad()
    },[])

    function onMusicProductLoad(){
        setProductFilesFetched(true);
        const ajaxUrl = window.location.origin + "/p/"+p.project_id+"/loadfilesjson";
        $.ajax({
            url: ajaxUrl
        }).done(function(res) {
            let newProductFiles = [];
            res.forEach(function(f,index){
                if ( f.type.split('/')[0] === "audio" ||  f.type.split('/')[1] === "ogg"){
                    let nf = f;
                    nf.musicSrc = f.url.replace(/%2F/g,'/').replace(/%3A/g,':');
                    nf.cover = imgUrl;
                    newProductFiles.push(nf);
                }
            });
            setProductFiles(newProductFiles);
        });
    }

    function onImageLoadError(){
        const ajaxUrl = window.location.origin + "/p/"+p.project_id+"/loadfilesjson";
        $.ajax({
            url: ajaxUrl
        }).done(function(res) {
            let newImgUrl;
            res.forEach(function(f,index){
                if ( f.type.split('/')[0] === "image"){
                    newImgUrl = f.url.replace(/%2F/g,'/').replace(/%3A/g,':');
                }
            });
            if (!newImgUrl){
                newImgUrl = "https://cn.opendesktop.";
                newImgUrl += window.location.host.endsWith('org') === true || window.location.host.endsWith('com') === true  ? "org" : "cc";
                newImgUrl += "/cache/" + Math.ceil(props.itemWidth * 2) + "x" + Math.ceil(props.imgHeight * 2) + "/img/default.png";                 
            }
            setImgUrl(newImgUrl);
        });
    }

    const productBrowseItemLikesDislpay = (
        <div className="likes-counter">
            <div className="hearts-container">
                <span className="glyphicon glyphicon-heart"></span>
                <span className="glyphicon glyphicon-heart-empty"></span>
            </div>
            ({p.count_follower}) Likes
        </div>
    )
        
    let itemInfoDisplay,
        musicItemInfoDisplay, 
        musicPlayerDisplay,
        showIndex,
        itemInfoHeight;
    
    if (browseListType === "picture") {
        itemInfoDisplay = (
            <div className="product-browse-item-info">
                <h2>{p.title}</h2>
                <span>{p.cat_title}</span>
                <span>by <b>{p.username}</b></span>
            </div>
        )
    } else if (browseListType === "apps") {
        itemInfoDisplay = (
            <div className="product-browse-item-info">
                <h2>{p.title}</h2>
                <span>{p.cat_title}</span>
                <span>by <b>{p.username}</b></span>
            </div>
        )
    }
    else if (browseListType === "phone-pictures"){
        itemInfoDisplay = (
            <div className="product-browse-item-info">
                <h2>{p.title}</h2>
            </div>
        )        
    } 
    else if (browseListType === "comics"){
        itemInfoDisplay = (
            <div className="product-browse-item-info">
                <h2>{p.title}</h2>
                {productBrowseItemLikesDislpay}
            </div>
        )
    }
    else if (browseListType === "music" || browseListType === "music-test"){
        musicItemInfoDisplay = (
            <div className="product-browse-music-item-info">
                <h2>{p.title}</h2>
                {productBrowseItemLikesDislpay}
                <span>{p.cat_title}</span>
                <span>by <b>{p.username}</b></span>
            </div>            
        );
        if (productFiles && productFiles.length > 0){
                musicPlayerDisplay = (
                    <ProductBrowseItemPreviewMusicPlayerTwo
                        productFiles={productFiles} 
                        projectId={p.project_id} 
                        imgHeight={props.imgHeight}
                    />
                )
        }
    }
    else if (browseListType === "videos"){
        itemInfoDisplay = (
            <div className="product-browse-item-info">
                <h2>{p.title}</h2>
                {productBrowseItemLikesDislpay}
                <div className="info-container">
                    <span>{p.cat_title}</span>
                    <span>by <b>{p.username}</b></span>
                </div>
            </div>
        )
    }    
    else if (browseListType === "favorites"){

        itemInfoHeight = props.imgHeight;
        showIndex = true;
        itemInfoDisplay = (
            <div className="product-browse-item-info">
                <div className="info-container">
                    <h2>{p.title}</h2>
                    <span>{p.cat_title}</span>
                    <span>by <b>{p.username}</b></span>
                </div>
                <div className="score-container">
                    <div className="explore-product-plings">
                        <div className="rating">
                            <div className="rating-text">
                                <small className="center-block text-center">
                                   Score {p.laplace_score / 10}%
                                </small>
                            </div>
                            <div className="progress">
                                <div className="progress-bar" style={{"backgroundColor":"#c8c8c8","width":(p.laplace_score / 10) + "%"}}>
                                </div>
                                <div className="progress-bar" style={{"backgroundColor":"#eeeeee","opacity":"0.5","width":( 100 - (p.laplace_score / 10)) + "%"}}>           
                                </div>
                            </div>
                        </div>
                        <div className="collected">
                            <span>{p.created_at}</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    let indexDisplay;
    if (showIndex === true){
        indexDisplay = (
            <span className="index">{props.rowIndex + 1}</span>
        )
    }
    
    let itemLink = json_serverUrl;
    itemLink = is_show_real_domain_as_url === 1 ? "/" : "/s/" + json_store_name + "/";
    itemLink += p.type_id === "3" ? "c" : "p";
    itemLink += "/" + p.project_id;
    
    return (
        <div className={"product-browse-item " + browseListType} id={"product-" + p.project_id} style={{"width":props.itemWidth}}>
            <div className="wrapper">
                {indexDisplay}
                {musicPlayerDisplay}
                <a href={itemLink} className="product-browse-item-wrapper">
                    <div className="product-browse-image">
                        <img src={imgUrl} height={props.imgHeight} onError={onImageLoadError}/>
                        {musicItemInfoDisplay}
                    </div>
                    {itemInfoDisplay}
                </a>
            </div>
        </div>
    )
}

function ProductBrowseItemPreviewMusicPlayerTwo(props){

    const [ productFiles, setProductFiles ] = useState(props.productFiles)
    console.log('files:');
    console.log(productFiles);
    const [ showAudioControls, setShowAudioControls ] = useState(false);
    const [ playIndex, setPlayIndex ] = useState(0);
    let initialPLayedAudioArray = [];
    if (productFiles){
        productFiles.forEach(function(i,index){
          const pa = {
            ...i,
            played:0,
            stopped:0
          }
          initialPLayedAudioArray.push(pa);
        })
    }
    const [ playedAudioArray, setPlayedAudioArray ] = useState(initialPLayedAudioArray);
    const [ isPlaying, setIsPlaying ] = useState(false);
    const [ isPaused, setIsPaused ] = useState(false);

    function onPlayClick(pIndex){
        const playerElement = document.getElementById("product-browse-music-player-"+props.projectId).getElementsByTagName('audio');
        let currentSrc;
        if (isPaused === false) {
            currentSrc = productFiles[pIndex].musicSrc;
            playerElement[0].src = currentSrc;
        }
        playerElement[0].play();
        setShowAudioControls(true);
        setIsPlaying(true);
        setIsPaused(false);
        onReportAudioPlay(currentSrc);
    }

    function onPauseClick(){
        const playerElement = document.getElementById("product-browse-music-player-"+props.projectId).getElementsByTagName('audio');
        playerElement[0].pause();
        setShowAudioControls(false);
        setIsPlaying(false);
        setIsPaused(true);
        onReportAudioStop(productFiles[playIndex].musicSrc)
    }

    function onPrevTrackPlayClick(){
        let prevTrackIndex;
        if (playIndex === 0){
            prevTrackIndex = productFiles.length - 1;
        } else {
            prevTrackIndex = playIndex - 1;
        }
        setPlayIndex(prevTrackIndex);
        onPlayClick(prevTrackIndex);
    }

    function onNextTrackPlayClick(){
        let nextTrackIndex;
        if (playIndex + 1 === productFiles.length){
            nextTrackIndex = 0;
        } else {
            nextTrackIndex = playIndex + 1;
        }
        setPlayIndex(nextTrackIndex);
        onPlayClick(nextTrackIndex);
    }

    function onReportAudioPlay(src){
        const audioItem = playedAudioArray.find((i => i.musicSrc === src));
        const audioItemIndex = playedAudioArray.findIndex((i => i.musicSrc === src));
        const newAudioItem = {
          ...audioItem,
          played:audioItem.played + 1
        }
        const newPLayedAudioArray = [
          ...playedAudioArray.slice(0,audioItemIndex),
          newAudioItem,
          ...playedAudioArray.slice(audioItemIndex + 1, playedAudioArray.length)
        ];
        setPlayedAudioArray(newPLayedAudioArray);

        if (playedAudioArray[audioItemIndex].played === 0){
          const audioStartUrl = window.location.href + "/p/" + props.projectId + "/" + 'startmediaviewajax?collection_id='+audioItem.collection_id+'&file_id='+audioItem.id+'&type_id=2';

          $.ajax({url: audioStartUrl}).done(function(res) { 

            const newAudioItem = {
              ...audioItem,
              mediaViewId:res.MediaViewId,
              played:audioItem.played + 1
            }
            const newPLayedAudioArray = [
              ...playedAudioArray.slice(0,audioItemIndex),
              newAudioItem,
              ...playedAudioArray.slice(audioItemIndex + 1, playedAudioArray.length)
            ];
            setPlayedAudioArray(newPLayedAudioArray);
          });
        }    
    }
    
    function onReportAudioStop(src){

        const audioItem = playedAudioArray.find((i => i.musicSrc === src));
        const audioItemIndex = playedAudioArray.findIndex((i => i.musicSrc === src));
        const newAudioItem = {
            ...audioItem,
            stopped:audioItem.stopped + 1
        }
        const newPLayedAudioArray = [
            ...playedAudioArray.slice(0,audioItemIndex),
            newAudioItem,
            ...playedAudioArray.slice(audioItemIndex + 1, playedAudioArray.length)
        ];
        setPlayedAudioArray(newPLayedAudioArray);
        // console.log('stppped - ' + playedAudioArray[audioItemIndex].stopped)
        if  (playedAudioArray[audioItemIndex].stopped === 0){

            const audioStopUrl = window.location.href + "/p/" + props.projectId + "/" + "stopmediaviewajax?media_view_id=" + playedAudioArray[audioItemIndex].mediaViewId;
            $.ajax({url: audioStopUrl}).done(function(res) { 

            });
        }
    }

    let musicPlayerDisplay;
    if (productFiles) {

        const playButtonElement = (
            <svg fill="currentColor" preserveAspectRatio="xMidYMid meet" height="1em" width="1em" viewBox="0 0 40 40" className="play-icon">
                <g><path d="m20.1 2.9q4.7 0 8.6 2.3t6.3 6.2 2.3 8.6-2.3 8.6-6.3 6.2-8.6 2.3-8.6-2.3-6.2-6.2-2.3-8.6 2.3-8.6 6.2-6.2 8.6-2.3z m8.6 18.3q0.7-0.4 0.7-1.2t-0.7-1.2l-12.1-7.2q-0.7-0.4-1.5 0-0.7 0.4-0.7 1.3v14.2q0 0.9 0.7 1.3 0.4 0.2 0.8 0.2 0.3 0 0.7-0.2z"></path></g>
            </svg>
        )

        const pauseButtonElement = (
            <svg fill="currentColor" preserveAspectRatio="xMidYMid meet" height="1em" width="1em" viewBox="0 0 40 40" className="pause-icon">
                <g><path d="m18.7 26.4v-12.8q0-0.3-0.2-0.5t-0.5-0.2h-5.7q-0.3 0-0.5 0.2t-0.2 0.5v12.8q0 0.3 0.2 0.5t0.5 0.2h5.7q0.3 0 0.5-0.2t0.2-0.5z m10 0v-12.8q0-0.3-0.2-0.5t-0.5-0.2h-5.7q-0.3 0-0.5 0.2t-0.2 0.5v12.8q0 0.3 0.2 0.5t0.5 0.2h5.7q0.3 0 0.5-0.2t0.2-0.5z m8.6-6.4q0 4.7-2.3 8.6t-6.3 6.2-8.6 2.3-8.6-2.3-6.2-6.2-2.3-8.6 2.3-8.6 6.2-6.2 8.6-2.3 8.6 2.3 6.3 6.2 2.3 8.6z"></path></g>
            </svg>
        )

        const prevButtonElement = (
            <svg fill="currentColor" preserveAspectRatio="xMidYMid meet" height="1em" width="1em" viewBox="0 0 40 40" className="prev-icon">
                <g><path d="m15.9 20l14.1-10v20z m-5.9-10h3.4v20h-3.4v-20z"></path></g>
            </svg>
        )

        const nextButtonElement = (
            <svg fill="currentColor" preserveAspectRatio="xMidYMid meet" height="1em" width="1em" viewBox="0 0 40 40" className="next-icon">
                <g><path d="m26.6 10h3.4v20h-3.4v-20z m-16.6 20v-20l14.1 10z"></path></g>
            </svg>
        )

        let prevDisplay, nextDisplay;
        if (productFiles.length > 1 && showAudioControls){
            prevDisplay = <span  onClick={() => onPrevTrackPlayClick()}>{prevButtonElement}</span>
            nextDisplay = <span   onClick={() => onNextTrackPlayClick()}>{nextButtonElement}</span>
        }

        let playButtonDisplay;
        if (isPlaying === true) playButtonDisplay = <span  onClick={() => onPauseClick()}>{pauseButtonElement}</span>
        else playButtonDisplay = <span  onClick={() => onPlayClick(playIndex)}>{playButtonElement}</span>

        let trackCounterDisplay;
        if (showAudioControls === true){
            trackCounterDisplay = (
                <div className="track-counter">
                    {playIndex + 1}/{productFiles.length}
                </div>
            )
        }
        
        musicPlayerDisplay = (
            <div className="player" id={"product-browse-music-player-" + props.projectId}>
                  <audio></audio>
                  <div className="player-interface">
                    <div className="audio-player-controls">
                        {prevDisplay}
                        {playButtonDisplay}
                        {nextDisplay}
                    </div>
                    {trackCounterDisplay}
                  </div>
            </div>
        )
    }

    let showControlsCssClass = "";
    if (showAudioControls === true) showControlsCssClass = " show-controls"

    let isMobileCssClass = "";
    if (isMobile === true) isMobileCssClass = " mobile";

    return (
        <div className={"product-browse-item-preview-music-player" + showControlsCssClass + isMobileCssClass} id={"music-player-"+props.projectId}>
            {musicPlayerDisplay}
        </div>
    )
}

export default ProductBrowseItem;