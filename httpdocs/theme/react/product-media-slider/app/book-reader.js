import React, { Component, useState } from 'react';
import {
  EpubView, // Underlaying epub-canvas (wrapper for epub.js iframe)
  EpubViewStyle, // Styles for EpubView, you can pass it to the instance as a style prop for customize it
  ReactReader, // A simple epub-reader with left/right button and chapter navigation
  ReactReaderStyle // Styles for the epub-reader it you need to customize it
} from "react-reader";
import {ConvertObjectToArray} from './product-media-slider-helpers';
import { func } from 'prop-types';

/*function BookReaderWrapper(props){

  const [ chapters, setChapters ] = useState([]);
  const [ currentChapter, setCurrentChapter ] = useState();
  const [ readerContent, setReaderContent ] = useState(null);

  React.useEffect(() => {
    console.log('on get toc');
    getTableOfContents();
  },[])

  React.useEffect(() => {
    console.log(chapters);
    console.log('on chapters change');
    if (chapters.length > 0){
      console.log('get & set first chapter');
      setCurrentChapter(1);
      getChapter();
    }
  },[chapters])

  function getTableOfContents(){
    console.log('get toc');
    const url = json_server_comics + "/api/files/toc?id="+props.slide.file_id+"&format=json";
    $.ajax({url:url}).done(function(res){
      const newChapters = ConvertObjectToArray(res.files);
      setChapters(newChapters);
    });
  }

  function getChapter(chapter){
    if (!chapter) chapter = chapters[0];
    console.log(chapter);    
    const url = json_server_comics + "/api/files/page?id="+props.slide.file_id+"&filename="+chapter.tag.src; 
    $.ajax({url:url}).done(function(res){
      setReaderContent(res);
    });   
  }

  return (
    <div id="book-reader-wrapper">
      <div id="viewer" className="spreads" dangerouslySetInnerHTML={{__html:readerContent}}></div>
    </div>
  )
}*/

/*function BookReaderWrapper(props){

    const [ renditionState, setRenditionState ] = useState();
    const [ currentPage, setCurrentPage ] = useState();
    const [ totalPages, setTotalPages ] = useState();

    React.useEffect(() => {
      console.log(renditionState);
      if (renditionState){
        if (renditionState.location !== undefined){
          console.log(renditionState.location.start.cfi);
          console.log(renditionState.book.locations.locationFromCfi(renditionState.location.start.cfi))
          const location = renditionState.book.locations.locationFromCfi(renditionState.location.start.cfi);
          setTotalPages(renditionState.location.total);        
          setCurrentPage(location);
        }
      }
    },[renditionState])

    function onGetRendition(rendition){
      console.log(rendition);
      setRenditionState(rendition);
    }

    function onLocationChanged(epubcifi,rendition){
      console.log(rendition);
      setRenditionState(rendition);
      console.log('on location changeds');
      // console.log(epubcifi);
    }

    function onTocChanged(toc){
      console.log('on toc changed')
      console.log(toc)
    }

    return (
      <div id="book-reader-wrapper">
        <div id="viewer" className="spreads" style={{ position: "relative", height: "100%" }}>
          {" "}
          <ReactReader
            url={props.slide.url}
            title={props.slide.title}
            locationChanged={(epubcifi,rendition) => onLocationChanged(epubcifi,rendition)}
            getRendition={rendition => onGetRendition(rendition)}
            tocChanged={toc => onTocChanged(toc)}
          />
          <span>{currentPage}/{totalPages}</span>
        </div>
      </div>
    );
}*/

function BookReaderWrapper(props){

  const [ loading, setLoading ] = useState(true);
  const [ renditionState , setRenditionState ] = useState()
  const [ currentPage, setCurrentPage ] = useState();
  const [ totalPages, setTotalPages ] = useState();

  React.useEffect(() => {initBookReader()},[])
  React.useEffect(() => { 
    if (window.book) window.book.destroy()
    initBookReader()
  },[props.cinemaMode,props.width])

  console.log(renditionState);

  function initBookReader(){
    console.log('init book reader');
    console.log(props.slide.url);
    // Initialize the book
    window.book = ePub(props.slide.url, {});
    
    window.rendition = book.renderTo('viewer', {
        flow: 'paginated',
        manager: 'default',
        spread: 'always',
        width: (props.width - 134),
        height: (props.height - 31)
    });

    setRenditionState(rendition)

    // Display the book
    window.displayed = window.rendition.display(window.location.hash.substr(1) || undefined);
    displayed.then(function() {
        console.log('displayed.then()');
        console.log('rendition.currentLocation():', rendition.currentLocation());
    });

    // Generate location and pagination
    window.book.ready.then(function() {
        console.log('book.ready.then()');
        const stored = localStorage.getItem(book.key() + '-locations');
        // console.log('metadata:', book.package.metadata);
        if (stored) {
            return window.book.locations.load(stored);
        } else {
            return window.book.locations.generate(1024); // Generates CFI for every X characters (Characters per/page)
        }

    }).then(function(location) { // This promise will take a little while to return (About 20 seconds or so for Moby Dick)
        localStorage.setItem(book.key() + '-locations', book.locations.save());
    });

    // When navigating to the next/previous page
    window.rendition.on('relocated', function(locations) {
        console.log('rendition.getContents():',rendition.getContents());
        console.log('rendition.currentLocation():', rendition.currentLocation());
        setCurrentPage(book.locations.locationFromCfi(locations.start.cfi));
        setTotalPages(book.locations.total)
        if (loading === true) setLoading(false);
    })
  }

  function goPrev(){
    renditionState.prev();
  }

  function goNext(){
    renditionState.next();
  }

 function onStartClick(){
   renditionState.moveTo(0);
   setCurrentPage(0);
  }

   function onEndClick(){
    const lastPageCfi = renditionState.book.locations.spine._locations[renditionState.book.locations.spine._locations.length - 1];
    renditionState.display(lastPageCfi);
  } 
  
  function onPageNumberInput(val){
    console.log(val);
    console.log(renditionState.book.locations.spin._locations[val]);
  }

  let loadingDisplay = <div id="ajax-loader"></div>
  let bookNavigation;
  if (loading === false){
    loadingDisplay = "";
    bookNavigation = (
      <div id="book-pager">
        <div>
          <span><a onClick={() => onStartClick()}>First Page</a></span>
          <span><input type="number" onChange={(e) => onPageNumberInput(e.target.value)}/></span>
          <span><span>{currentPage + "/" + totalPages}</span></span>
          <span><a onClick={() => onEndClick()}>Last Page</a></span>
        </div>
      </div>
    )
  }

  return (
    <div id="book-reader-wrapper">
      {loadingDisplay}
      <div id="prev" className="arrow" onClick={goPrev}>
        <span className="glyphicon glyphicon-chevron-left"></span>  
      </div>
      <div id="viewer" className="spreads">1
      </div>
      {bookNavigation}
      <div id="next" className="arrow" onClick={goNext}>
        <span className="glyphicon glyphicon-chevron-right"></span>  
      </div>
    </div>
  )
}

export default BookReaderWrapper;