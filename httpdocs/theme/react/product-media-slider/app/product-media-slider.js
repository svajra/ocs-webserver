import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import VideoPlayerWrapper from './video-player';
// import Draggable, {DraggableCore} from 'react-draggable'; // Both at the same time
import { Scrollbars } from 'react-custom-scrollbars';


function ProductMediaSlider(){ 

  /* Component */

  const [ product, setProduct ] = useState(window.product);

  let galleryArray = []
  if (window.galleryPicturesJson) window.galleryPicturesJson.forEach(function(gp,index){ galleryArray.push({url:gp,type:'image'}); });
  else galleryArray = [{url:product.image_small,type:'image'} ];
  if (product.embed_code !== null && product.embed_code.length > 0) galleryArray = [{url:product.embed_code,type:'embed'}, ... galleryArray ];
  if (window.filesJson) {
    window.filesJson.forEach(function(f,index){  
      if (f.type.indexOf('video') > -1 || f.type.indexOf('audio') > -1) galleryArray = [{url:f.url,type:f.type.split('/')[0]}, ... galleryArray] 
    })
  }

  const [ gallery, setGallery ] = useState(galleryArray);
  const parentContainerElement = document.getElementById('product-title-div');
  const [ containerWidth, setContainerWidth ] = useState(parentContainerElement.offsetWidth);
  const [ currentSlide, setCurrentSlide ] = useState(0)
  const [ sliderWidth, setSliderWidth ] = useState(containerWidth * gallery.length);
  const [ sliderHeight, setSliderHeight ] = useState(360);
  const [ sliderPosition, setSliderPosition ] = useState(containerWidth * currentSlide);
  const [ cinemaMode, setCinemaMode ] = useState(false);
  const [ showPlaylist, setShowPlaylist ] = useState(true);
  const [ showSliderArrows, setShowSliderArrows ] = useState(true);
  
  React.useEffect(() => { initProductMediaSlider() },[])
  React.useEffect(() => { updateDimensions() },[currentSlide, cinemaMode])

  // init product media slider
  function initProductMediaSlider(){
    window.addEventListener("resize", updateDimensions);
    window.addEventListener("orientationchange", updateDimensions);
  }

  // update dimensions
  function updateDimensions(){
    const newContainerWidth = parentContainerElement.offsetWidth;
    setContainerWidth(newContainerWidth)
    setSliderWidth(newContainerWidth * gallery.length);
    setSliderPosition(newContainerWidth * currentSlide);
    document.getElementById('product-page-content').removeEventListener("DOMNodeRemoved", updateDimensions);
    document.getElementById('product-page-content').removeEventListener("DOMNodeInserted", updateDimensions);    
  }

  // toggle cinema mode
  function toggleCinemaMode(){
    document.getElementById('product-page-content').addEventListener("DOMNodeRemoved", updateDimensions);
    document.getElementById('product-page-content').addEventListener("DOMNodeInserted", updateDimensions);    
    const newCinemaMode = cinemaMode === true ? false : true;
    const targetParentElement = cinemaMode === true ? $('#product-main') : $('#product-page-content');
    const targetChildPrependedElement = cinemaMode === true ? $('#product-title-div') : $('#product-media-slider-container');
    $('#product-main-img-container').prependTo(targetParentElement);
    $(targetChildPrependedElement).prependTo('#product-main-img-container');
    $("#product-media-slider-container").toggleClass("imgsmall");
    $("#product-media-slider-container").toggleClass("imgfull");
    setCinemaMode(newCinemaMode);
  }

  // toggle show playlist
  function toggleShowPlaylist(){
    const newShowPlaylistValue = showPlaylist === true ? false : true;
    setShowPlaylist(newShowPlaylistValue)
  }
  
  console.log('show slider arrows - ' + showSliderArrows);  

  /* Render */

  // media slider css class
  let mediaSliderCssClass = "";
  if (cinemaMode === true) mediaSliderCssClass += "cinema-mode ";
  if (showSliderArrows === false) mediaSliderCssClass += "hide-arrows";

  // slider container style
  const sliderContainerStyle = {
    width:sliderWidth+'px',
    height:sliderHeight+'px'
  }

  // slider wrapper style
  const sliderWrapperStyle = {
    width:sliderWidth+'px',
    left:'-'+sliderPosition+'px',
    height:sliderHeight+'px'
  }

  // prev / next slide arrow values
  const prevCurrentSlide = currentSlide > 0 ? currentSlide - 1 : gallery.length - 1;
  const nextCurrentSlide = currentSlide < (gallery.length - 1) ? ( currentSlide + 1 ) : 0;

  // slider arrows css
  const sliderArrowCss = { top:((sliderHeight / 2 ) - 40)+'px' }

  // slides display
  const slidesDisplay = gallery.map((s,index) => (
    <SlideItem 
      key={index}
      slideIndex={index}
      slide={s}
      currentSlide={currentSlide}
      containerWidth={containerWidth}
      sliderHeight={sliderHeight}
      cinemaMode={cinemaMode}
      onCinemaModeClick={toggleCinemaMode}
    />
  ));

  let playlistDisplay;
  if (showPlaylist){
    playlistDisplay = (
      <SlidesNavigation
        gallery={gallery}
        currentSlide={currentSlide}
        containerWidth={containerWidth}
        onChangeCurrentSlide={e => setCurrentSlide(e)}
      />
    )
  }

  return (
    <main id="media-slider" 
      style={{height:sliderHeight}} 
      className={mediaSliderCssClass}
      onMouseEnter={() => showSliderArrows(true)}
      onMouseLeave={() => showSliderArrows(false)}>

      <div id="slider-container" style={sliderContainerStyle}>
        <a className="left carousel-control" id="arrow-left" style={sliderArrowCss} onClick={() => setCurrentSlide(prevCurrentSlide)}>
          <span className="glyphicon glyphicon-chevron-left"></span>
        </a>
        <div id="slider-wrapper" style={sliderWrapperStyle}>
          {slidesDisplay}    
        </div>
        <a className="right carousel-control" id="arrow-right" style={sliderArrowCss} onClick={() => setCurrentSlide(nextCurrentSlide)}>
          <span className="glyphicon glyphicon-chevron-right"></span>
        </a>      
      </div>
      <a className="slider-navigation-toggle" onClick={toggleShowPlaylist}></a>
      {playlistDisplay}
    </main>
  )
}

function SlideItem(props){
  
  let slideContentDisplay, slideMediaItemMenu;
  if (props.slide.type === "embed") slideContentDisplay = <div dangerouslySetInnerHTML={{__html: props.slide.url}} />;
  else if (props.slide.type === "image") {
    slideContentDisplay = <img onClick={props.onCinemaModeClick} id={"slide-img-"+props.slideIndex} src={props.slide.url}/>
    /*slideMediaItemMenu = (
      <ul className="slide-media-item-menu">
        <li><a onClick={props.onCinemaModeClick} className="cinema-mode">cinema</a></li>
        <li><a className="full-screen">full screen</a></li>
      </ul>
    )*/
  }
  else if (props.slide.type === "video") {
    slideContentDisplay = (
      <VideoPlayerWrapper 
        height={props.sliderHeight}
        width={(props.containerWidth * 0.7)} 
        source={props.slide.url} 
        onCinemaModeClick={props.onCinemaModeClick}
        playVideo={props.currentSlide === props.slideIndex}
      />
    )
  }

  return(
    <div className={props.currentSlide === props.slideIndex ? "active slide-item" : "slide-item" } id={"slide-"+props.slideIndex} style={ { width:props.containerWidth, height:props.sliderHeight }}>
      {slideContentDisplay}
      {slideMediaItemMenu}
    </div>
  )
}

function SlidesNavigation(props){

  const scrollBarEl = useRef(null)
  const thumbElementWidth = 140;
  const [ thumbSliderWidth, setThumbSliderWidth ] = useState((thumbElementWidth * props.gallery.length) +10);
  let thumbSliderPosition = 0;
  const currentThumbPosition = (props.currentSlide * thumbElementWidth) + thumbElementWidth;
  if (currentThumbPosition > props.containerWidth) thumbSliderPosition = (currentThumbPosition - props.containerWidth) + 10;

  React.useEffect(() => { scrollSlider() },[])
  React.useEffect(() => { scrollSlider() },[props.currentSlide])

  function scrollSlider(){
    $('#slide-navigation').children().attr('id','slider-scroll-wrapper');
    $('#slider-scroll-wrapper').children().attr('id','slider-scroll');
    $('#slider-scroll').scrollLeft(thumbSliderPosition)
    scrollBarEl.current.scrollLeft(thumbSliderPosition);
  }

  const slidesThumbnailNavigationDisplay = props.gallery.map((g, index) => {
    let image;
    if (g.type === "image") image = <img src={g.url.split('/img')[0] + "/cache/120x80-1/img" + g.url.split('/img')[1]}/>
    else if (g.type === "video") image = <span className="glyphicon glyphicon-play"></span>
    return (
      <li key={index}  className={ props.currentSlide === index ? "active " + g.type : g.type}>
        <a onClick={e => props.onChangeCurrentSlide(index)}>{image}</a>
      </li>
    )
  })

  const thumbSliderStyle = {
    position:'absolute',
    top:'0',
    width:thumbSliderWidth+'px',
  }

  return (
    <div id="slide-navigation">
      <Scrollbars ref={scrollBarEl} style={{ width: props.containerWidth, height: 110 }}>
          <ul className="thumbnail-navigation" style={thumbSliderStyle}>{slidesThumbnailNavigationDisplay}</ul>
      </Scrollbars>
    </div>
  )
}

const rootElement = document.getElementById("product-media-slider-container");
ReactDOM.render(<ProductMediaSlider />, rootElement);