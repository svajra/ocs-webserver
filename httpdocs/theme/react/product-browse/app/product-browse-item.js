import React, { useState } from 'react';
import ReactJkMusicPlayer from "react-jinke-music-player";
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
        if (browseListType === "music" && productFilesFetched === false) onMusicProductLoad()
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
            ({p.count_likes - p.count_dislikes}) Likes
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
    } else if (browseListType === "phone-pictures"){
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
    else if (browseListType === "music"){
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
                <ProductBrowseItemPreviewMusicPlayer 
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
    itemLink = json_store_name === "ALL" ? "/" : "/s/" + json_store_name + "/";
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

function ProductBrowseItemPreviewMusicPlayer(props){

    const [ productFiles, setProductFiles ] = useState(props.productFiles)

    const [ showAudioControls, setShowAudioControls ] = useState(false);
    const [ playIndex, setPlayIndex ] = useState();
    let initialPLayedAudioArray = [];
    if (productFiles){
        productFiles.forEach(function(i,index){
          let pl = 0;
          if (index === 0) pl = -1;
          const pa = {
            ...i,
            played:pl,
            stopped:0
          }
          initialPLayedAudioArray.push(pa);
        })
    }
    const [ playedAudioArray, setPlayedAudioArray ] = useState(initialPLayedAudioArray);



    function onReportAudioPlay(audioInfo){

        const audioItem = playedAudioArray.find((i => i.musicSrc === audioInfo.musicSrc));
        const audioItemIndex = playedAudioArray.findIndex((i => i.musicSrc === audioInfo.musicSrc));
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
          console.log(audioStartUrl)
          $.ajax({url: audioStartUrl}).done(function(res) { 
            console.log(res);
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
    
    function onReportAudioStop(audioInfo){
        const audioItem = playedAudioArray.find((i => i.musicSrc === audioInfo.musicSrc));
        const audioItemIndex = playedAudioArray.findIndex((i => i.musicSrc === audioInfo.musicSrc));
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
            console.log(playedAudioArray);
            const audioStopUrl = window.location.href + "/p/" + props.projectId + "/" + "stopmediaviewajax?media_view_id=" + playedAudioArray[audioItemIndex].mediaViewId;
            $.ajax({url: audioStopUrl}).done(function(res) { 
            console.log(res);
            });
        }
    }

    let musicPlayerDisplay;

    if (productFiles) {

        const options = {
            //audio lists model
            audioLists:productFiles,
            audioListsPanelVisible:false,
            //default play index of the audio player  [type `number` default `0`]
            defaultPlayIndex: 0,
            //if you want dynamic change current play audio you can change it [type `number` default `0`]
            // playIndex: 0,
            //color of the music player theme    [ type `string: 'light' or 'dark'  ` default 'dark' ]
            theme: "dark",
            // Specifies movement boundaries. Accepted values:
            // - `parent` restricts movement within the node's offsetParent
            //    (nearest node with position relative or absolute), or
            // - a selector, restricts movement within the targeted node
            // - An object with `left, top, right, and bottom` properties.
            //   These indicate how far in each direction the draggable
            //   can be moved.
            bounds: "product-"+props.projectId,
            //Whether to load audio immediately after the page loads.  [type `Boolean | String`, default `false`]
            //"auto|metadata|none" "true| false"
            preload: false,
            //Whether the player's background displays frosted glass effect  [type `Boolean`, default `false`]
            glassBg: false,
            //The next time you access the player, do you keep the last state  [type `Boolean` default `false`]
            remember: false,
            //The Audio Can be deleted  [type `Boolean`, default `true`]
            remove: false,
            //audio controller initial position    [ type `Object` default '{top:0,left:0}' ]
            defaultPosition: {
              top: 50,
              left: 50
            },
            // play mode text config of the audio player
            playModeText: {
              order: "order",
              orderLoop: "loop",
              singleLoop: "single loop",
              shufflePlay: "shuffle"
            },
            //audio controller open text  [ type `String | ReactNode` default 'open']
            openText: "open",
            //audio controller close text  [ type `String | ReactNode` default 'close']
            closeText: "close",
            //audio theme switch checkedText  [ type `String | ReactNode` default '-']
            checkedText: "dark",      
            //audio theme switch unCheckedText [ type `String | ReactNode` default '-']
            unCheckedText: "light",
            // audio list panel show text of the playlist has no songs [ type `String` | ReactNode  default 'no music']
            notContentText: "No Music",
            panelTitle: "Test",
            defaultPlayMode: "order",
            //audio mode        mini | full          [type `String`  default `mini`]
            mode: "full",
              // [ type `Boolean` default 'false' ]
              // The default audioPlay handle function will be played again after each pause, If you only want to trigger it once, you can set 'true'
            once: true,
            //Whether the audio is played after loading is completed. [type `Boolean` default 'true']
            autoPlay: false,
            //Whether you can switch between two modes, full => mini  or mini => full   [type 'Boolean' default 'true']
            toggleMode: false,
            //audio cover is show of the "mini" mode [type `Boolean` default 'true']
            showMiniModeCover: false,   
            //audio playing progress is show of the "mini"  mode
            showMiniProcessBar: false,
            //audio controller is can be drag of the "mini" mode     [type `Boolean` default `true`]
            drag: true,
            //drag the audio progress bar [type `Boolean` default `true`]
            seeked: false,
            //audio controller title [type `String | ReactNode`  default <FaHeadphones/>]
            // controllerTitle: <FaHeadphones />,
            //Displays the audio load progress bar.  [type `Boolean` default `true`]
            showProgressLoadBar: false,
            //play button display of the audio player panel   [type `Boolean` default `true`]
            showPlay: true,
            //reload button display of the audio player panel   [type `Boolean` default `true`]
            showReload: false,
            //download button display of the audio player panel   [type `Boolean` default `true`]
            showDownload: false,
            //loop button display of the audio player panel   [type `Boolean` default `true`]
            showPlayMode: false,
            //theme toggle switch  display of the audio player panel   [type `Boolean` default `true`]
            showThemeSwitch: false,
            //lyric display of the audio player panel   [type `Boolean` default `false`]
            showLyric: false,
            //Extensible custom content       [type 'Array' default '[]' ]
            extendsContent: [],
            //default volume of the audio player [type `Number` default `100` range `0-100`]
            defaultVolume: 50,
            //playModeText show time [type `Number(ms)` default `700`]
            playModeShowTime: 600,
            //Whether to try playing the next audio when the current audio playback fails [type `Boolean` default `true`]
            loadAudioErrorPlayNext: false,
            //Music is downloaded handle
            //onAudioDownload(audioInfo) { console.log("audio download", audioInfo); },
            //audio play handle
            onAudioPlay(audioInfo) {
                console.log('audio play');
                setShowAudioControls(true);
                const currentIndex = productFiles.findIndex(f => audioInfo.name === f.title);
                setPlayIndex(currentIndex + 1);
                onReportAudioPlay(audioInfo);
            },
            //audio pause handle
            onAudioPause(audioInfo) { 
              console.log("audio pause"); 
              setShowAudioControls(false)
              onReportAudioStop(audioInfo)
            },
            //When the user has moved/jumped to a new location in audio
            onAudioSeeked(audioInfo) { console.log("audio seeked", audioInfo); },
            //When the volume has changed  min = 0.0  max = 1.0
            onAudioVolumeChange(currentVolume) { console.log("audio volume change", currentVolume); },
            //The single song is ended handle
            onAudioEnded(audioInfo) { console.log("audio ended", audioInfo); },
            //audio load abort The target event like {...,audioName:xx,audioSrc:xx,playMode:xx}
            onAudioAbort(e) { console.log("audio abort", e); },
            //audio play progress handle
            onAudioProgress(audioInfo) { 
                if (audioInfo.paused === false){
                    $('#music-player-'+props.projectId).find('.play-btn.play').trigger("click");
                }
            },
            //audio reload handle
            onAudioReload(audioInfo) { 
                console.log("audio reload:", audioInfo);
            },
            //audio load failed error handle
            onAudioLoadError(e) { 
                console.log("audio load err", e); 
            },
            //theme change handle
            onThemeChange(theme) { 
                console.log("theme change:", theme); 
            },
            //audio lists change
            onAudioListsChange(currentPlayId, audioLists, audioInfo) {
              console.log("[currentPlayId] audio lists change:", currentPlayId);
              console.log("[audioLists] audio lists change:", audioLists);
              console.log("[audioInfo] audio lists change:", audioInfo);
            },
            onAudioPlayTrackChange(currentPlayId, audioLists, audioInfo) {
                const currentIndex = productFiles.findIndex(f => audioInfo.name === f.title);
                setPlayIndex(currentIndex + 1);
            },
            onPlayModeChange(playMode) { 
                console.log("play mode change:", playMode); 
            },
            onModeChange(mode) { 
                console.log("mode change:", mode); 
            },
            onAudioListsPanelChange(panelVisible) {
              /*const newShowPlayListValue = showPlaylist === true ? false : true;
              setShowPlaylist(newShowPlayListValue);*/
            }, 
            onAudioListsDragEnd(fromIndex, endIndex) {
              console.log("audio lists drag end:", fromIndex, endIndex);
            },
            onAudioLyricChange(lineNum, currentLyric) {
              console.log("audio lyric change:", lineNum, currentLyric);
            }
        };
    
        musicPlayerDisplay = (
            <div>
                <ReactJkMusicPlayer {...options} />
                <span className="music-player-counter">{playIndex}/{productFiles.length}</span>
            </div>
        )
    }

    let showControlsCssClass = "";
    if (showAudioControls === true) {
        showControlsCssClass = "show-controls"
    }

    return (
        <div className={"product-browse-item-preview-music-player " + showControlsCssClass} id={"music-player-"+props.projectId}>
            {musicPlayerDisplay}
        </div>
    )
}

export default ProductBrowseItem;