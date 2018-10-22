class CategoryTree extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
      categories:window.catTree,
      categoryId:window.categoryId,
      selectedCategories:[],
      loading:true,
      showCatTree:false
    };
    this.getSelectedCategories = this.getSelectedCategories.bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);
  }

  componentWillMount() {
    this.updateDimensions();
  }

  componentWillUnmount(){
    window.removeEventListener("resize", this.updateDimensions);
  }

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
    if (this.state.categoryId !== 0){
      this.getSelectedCategories(this.state.categories,this.state.categoryId);
    } else {
      this.setState({loading:false});
    }
  }

  getSelectedCategories(categories,catId){
    const selectedCategory = appHelpers.getSelectedCategory(this.state.categories,catId);
    const selectedCategories = this.state.selectedCategories;
    selectedCategory.selectedIndex = selectedCategories.length;
    selectedCategories.push(selectedCategory);
    this.setState({selectedCategories:selectedCategories},function(){
      if (typeof(selectedCategory.parent_id) === 'string'){
        this.getSelectedCategories(categories,parseInt(selectedCategory.parent_id));
      } else {
        this.setState({loading:false});
      }
    });
  }

  updateDimensions(){
    const device = appHelpers.getDeviceFromWidth(window.innerWidth);
    this.setState({device:device});
  }

  render(){
    let categoryTreeDisplay;
    if (!this.state.loading){

      if (this.state.device === "tablet" && !this.state.showCatTree && this.state.selectedCategories){
        categoryTreeDisplay = (
          <SelectedCategory
            categoryId={this.state.categoryId}
            selectedCategory={this.state.selectedCategories[0]}
          />
        );
      } else {
        if (this.state.categories){
          const categoryId = this.state.categoryId;
          const selectedCategories = this.state.selectedCategories;
          const categoryTree = this.state.categories.sort(appHelpers.sortArrayAlphabeticallyByTitle).map((cat,index) => (
            <CategoryItem
              key={index}
              category={cat}
              categoryId={categoryId}
              selectedCategories={selectedCategories}
            />
          ));
          categoryTreeDisplay = (
            <ul className="main-list">
              <li className="cat-item">
                <a href={window.baseUrl + "/browse/"}><span className="title">All</span></a>
              </li>
              {categoryTree}
            </ul>
          );
        }
      }

    }

    return(
      <div id="category-tree">
        {categoryTreeDisplay}
      </div>
    );
  }
}

class CategoryItem extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {};
  }

  render(){
    let categoryChildrenDisplay;

    const categoryType = appHelpers.getCategoryType(this.props.selectedCategories,this.props.categoryId,this.props.category.id);
    if (this.props.category.has_children === true && categoryType && this.props.lastChild !== true){

      const categoryId = this.props.categoryId;
      const category = this.props.category;
      const selectedCategories = this.props.selectedCategories;
      const children = appHelpers.convertObjectToArray(this.props.category.children);
      let lastChild;
      if (categoryType === "selected"){
        lastChild = true;
      }

      const categoryChildren = children.sort(appHelpers.sortArrayAlphabeticallyByTitle).map((cat,index) => (
        <CategoryItem
          key={index}
          category={cat}
          categoryId={categoryId}
          selectedCategories={selectedCategories}
          lastChild={lastChild}
          parent={category}
        />
      ));

      categoryChildrenDisplay = (
        <ul>
          {categoryChildren}
        </ul>
      );

    }

    let categoryItemClass = "cat-item";
    if (this.props.categoryId === parseInt(this.props.category.id)){
      categoryItemClass += " active";
    }

    let productCountDisplay;
    if (this.props.category.product_count !== "0"){
      productCountDisplay = this.props.category.product_count;
    }

    const categoryItemLink = appHelpers.generateCategoryLink(window.baseUrl,this.props.category.id,window.location.href);

    return(
      <li id={"cat-"+this.props.category.id} className={categoryItemClass}>
        <a href={categoryItemLink}>
          <span className="title">{this.props.category.title}</span>
          <span className="product-counter">{productCountDisplay}</span>
        </a>
        {categoryChildrenDisplay}
      </li>
    )
  }
}

class SelectedCategory extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {};
  }

  render(){
    let selectedCategoryDisplay;
    if (this.props.selectedCategory){
      selectedCategoryDisplay = (
        <a>{this.props.selectedCategory.title}</a>
      );
    }
    return (
      <div id="slected-category-tree-item">
        {selectedCategoryDisplay}
      </div>
    )
  }
}

ReactDOM.render(
    <CategoryTree />,
    document.getElementById('category-tree-container')
);
