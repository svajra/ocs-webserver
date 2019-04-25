function CategoryBlocks(){
    console.log(window.catTree)
    const [ categories, setCategories ] = React.useState(window.catTree)
    let categoriesDisplay;
    if (categories) categoriesDisplay = categories.map((c,index) => (<CategoryBlockItem category={c}/> ))
    return (
        <div id="category-blocks">
            <div className="container aih-container aih-section">
                <div className="aih-row">
                    {categoriesDisplay}
                </div>
            </div>
        </div>
    )
}

function CategoryBlockItem(props){
    const c = props.category;
    let sysTitle = c.title;
    if (c.title === "System & Tools") sysTitle = "systools";
    const imgUrl = "/theme/react/assets/img/aih-"+sysTitle+".png";
    const ribbonCssClass = "aih-ribbon aih-"+sysTitle.trim().toLowerCase();
    return (
        <a href={"/browse/cat/" + c.id}>
            <div className="aih-card">
                <div className={ribbonCssClass}></div>
                <img className="aih-thumb" src={imgUrl}/>
                <div className="aih-content">
                    <h3 className="aih-title">{c.title}</h3>
                    <p className="aih-counter">{c.product_count} <span>products</span></p>
                </div>
            </div>
        </a>        
    )
}

const rootElement = document.getElementById("category-blocks-container");
ReactDOM.render(<CategoryBlocks />, rootElement);