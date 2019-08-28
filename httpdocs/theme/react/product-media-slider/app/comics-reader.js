import React, { useState } from 'react';
import {generatePagesArray} from './product-media-slider-helpers';

function ComicsReaderWrapper(props){

    const [ loadingState, setLoadingState ] = useState('Loading...');

    const initPages = [
      "https://s6.mkklcdnv6.com/mangakakalot/r1/read_berserk_manga_online/chapter_230_qliphoth/1.jpg",
      "https://s6.mkklcdnv6.com/mangakakalot/r1/read_berserk_manga_online/chapter_230_qliphoth/2.jpg",
      "https://s6.mkklcdnv6.com/mangakakalot/r1/read_berserk_manga_online/chapter_230_qliphoth/3.jpg",
      "https://s6.mkklcdnv6.com/mangakakalot/r1/read_berserk_manga_online/chapter_230_qliphoth/4.jpg",
      "https://s6.mkklcdnv6.com/mangakakalot/r1/read_berserk_manga_online/chapter_230_qliphoth/5.jpg",
      "https://s6.mkklcdnv6.com/mangakakalot/r1/read_berserk_manga_online/chapter_230_qliphoth/6.jpg",
      "https://s6.mkklcdnv6.com/mangakakalot/r1/read_berserk_manga_online/chapter_230_qliphoth/7.jpg",
      "https://s6.mkklcdnv6.com/mangakakalot/r1/read_berserk_manga_online/chapter_230_qliphoth/8.jpg",
      "https://s6.mkklcdnv6.com/mangakakalot/r1/read_berserk_manga_online/chapter_230_qliphoth/9.jpg",
      "https://s6.mkklcdnv6.com/mangakakalot/r1/read_berserk_manga_online/chapter_230_qliphoth/10.jpg",
      "https://s6.mkklcdnv6.com/mangakakalot/r1/read_berserk_manga_online/chapter_230_qliphoth/11.jpg",
      "https://s6.mkklcdnv6.com/mangakakalot/r1/read_berserk_manga_online/chapter_230_qliphoth/12.jpg"
    ]

    const [ pages, setPages ] = useState(initPages);

    /* INIT */

    function fetchArchive(){
        var request = new XMLHttpRequest();
        request.open("GET", props.slide.url);
        request.responseType = "blob";
        request.onload = function() {
            var response = this.response;
            openArchive(response)
        }
        request.send()
    }

    function openArchive(res){
        if (props.slide.file_type === "cbz") openZipArchive(res);
        else if (props.slide.file_type === "cbr") openRarArchive(res);
    }

    function openZipArchive(res){
        setLoadingState('reading archive...');
        var zip = new JSZip()
        zip.loadAsync(res).then(function (data) {
            let pagesArray = [];
            let zipFileIndex = 0;
            for ( var i in data.files ){
                zip.files[data.files[i].name].async('blob').then(function(blob) {
                    zipFileIndex += 1;
                    const pageArrayItem = {
                        name:data.files[i].name,
                        blob:blob
                    }
                    pagesArray.push(pageArrayItem);
                    if (Object.keys(data.files).length === zipFileIndex) generateImageGallery(pagesArray);
                });
            }
        });
    }

    function generateImageGallery(pagesArray){
        setLoadingState('extracting images...');
        pagesArray.forEach(function(page,index){
            var reader = new FileReader();
            reader.onload = function() {
                const imgSrc = "data:image/" + page.name.split('.')[1] + ";base64," + reader.result.split(';base64,')[1];
                let newPages = pages;
                newPages.push(imgSrc);
                setPages(newPages);
            }; 
            reader.onerror = function(event) {
                console.error("File could not be read! Code " + event.target.error.code);
            };
            reader.readAsDataURL(page.blob);
        });
    }

    /* /INIT */

    /* COMPONENT */

    let comicsReaderDisplay = loadingState
    if (pages.length > 0){
      comicsReaderDisplay = (
        <ComicBookReader 
          pages={pages}
          currentSlide={props.currentSlide}
        />
      )
    }

    return (
        <div id="comics-reader-wrapper">
            {comicsReaderDisplay}
        </div>
    )
}

function ComicBookReader(props){

  const [ loading, setLoading ] = useState(false);
  const [ displayType, setDisplayType ] = useState("double")
  const [ pages, setPages ] = useState(generatePagesArray(props.pages,displayType))
  console.log(pages);
  const [ currentPage, setCurrentPage ] = useState(1)
  const [ totalPages, setTotalPages ] = useState(pages.length)
  const [ viewMode, setViewMode ] = useState('normal');

  React.useEffect(() => { 
    initComicReader()
  },[])

  function initComicReader(){
    $(function() {
      $( '#bb-bookblock-'+props.currentSlide ).bookblock( {
        speed : 800,
        shadowSides : 0.8,
        shadowFlip : 0.7,
        onBeforeFlip: function( page ) { onBeforeFlip(page) },
        onEndFlip	: function( page, isLimit ) {  readerOnEndFlip(page,isLimit) },
      } );
    })
  }

  function onComicReaderNavClick(val){
    $( '#bb-bookblock-'+props.currentSlide).bookblock(val);
  }

  function onBeforeFlip(page){
    return false;
  }

  function readerOnEndFlip(page,isLimit){
    setCurrentPage(isLimit + 1);
    return false;
  }

  let comicBookDisplay;
  if (loading) comicPages = "loading...";
  else {
    const comicPages = pages.map((p,index) => (
      <div key={index} className="bb-item">
        <img src={p[0]}/>
        <img src={p[1]}/>
      </div>      
    ))

    comicBookDisplay = (
      <div id={"bb-bookblock-" + props.currentSlide} className="bb-bookblock">
        {comicPages}
      </div>
    )
  }

  return (
    <div className={"comic-book-reader " + viewMode}>
      {comicBookDisplay}
      <div className="nav-container">
        <nav>
          <a id="bb-nav-counter" href="#">{currentPage + "/" + totalPages}</a>
          <a id="bb-nav-first" href="#" onClick={() => onComicReaderNavClick('first')}><span className="glyphicon glyphicon-step-backward"></span></a>
          <a id="bb-nav-prev" href="#" onClick={() => onComicReaderNavClick('prev')}><span className="glyphicon glyphicon-triangle-left"></span></a>
          <a id="bb-nav-next" href="#" onClick={() => onComicReaderNavClick('next')}><span className="glyphicon glyphicon-triangle-right"></span></a>
          <a id="bb-nav-last" href="#" onClick={() => onComicReaderNavClick('last')}><span className="glyphicon glyphicon-step-forward"></span></a>
          <a id="bb-nav-last" href="#" onClick={() => onComicReaderNavClick('last')}><span className="glyphicon glyphicon-step-forward"></span></a>
          <a id="bb-nav-viewmode" href="#" onClick={() => setViewMode('fullscreen')}><span className="glyphicon glyphicon-fullscreen"></span></a>
        </nav>
      </div>
    </div>
  )
}

function ComicBookReaderNavigation(props){

  return (
    <div className="comic-book-reader-navigation">
      <div className="scroll-bar"></div>
      <div className="actions-menu">
        <a className="page-counter"> {props.currentPage + "/" + props.totalPages} </a>
        <a onClick={props.onPrevPageBtnClick} className="prev-page"></a> 
        <a onClick={props.onNextPageBtnClick} className="next-page"></a>
        <a className="one-page-view"></a>
        <a className="two-page-view"></a>
        <a className="full-screen"></a>
      </div>
    </div>
  )
}
/*
			var Page = (function() {
				
				var config = {
						$bookBlock : $( '#bb-bookblock' ),
						$navNext : $( '#bb-nav-next' ),
						$navPrev : $( '#bb-nav-prev' ),
						$navFirst : $( '#bb-nav-first' ),
						$navLast : $( '#bb-nav-last' )
					},
					init = function() {
						config.$bookBlock.bookblock( {
							speed : 800,
							shadowSides : 0.8,
							shadowFlip : 0.7
						} );
						initEvents();
					},
					initEvents = function() {

						// add swipe events
						$slides.on( {
							'swipeleft' : function( event ) {
								config.$bookBlock.bookblock( 'next' );
								return false;
							},
							'swiperight' : function( event ) {
								config.$bookBlock.bookblock( 'prev' );
								return false;
							}
						} );

						// add keyboard events
						$( document ).keydown( function(e) {
							var keyCode = e.keyCode || e.which,
								arrow = {
									left : 37,
									up : 38,
									right : 39,
									down : 40
								};

							switch (keyCode) {
								case arrow.left:
									config.$bookBlock.bookblock( 'prev' );
									break;
								case arrow.right:
									config.$bookBlock.bookblock( 'next' );
									break;
							}
						} );
					};

					return { init : init };

      })();
      
      */
export default ComicsReaderWrapper;