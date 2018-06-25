class HomePageTemplateOne extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {};
    this.updateDimensions = this.updateDimensions.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
    if (nextProps.products && !this.state.products){
      this.setState({products:nextProps.products});
    }
    if (nextProps.domain){
      let env;
      if (appHelpers.splitByLastDot(nextProps.domain) === 'com'){
        env = 'live';
      } else {
        env = 'test';
      }
      this.setState({env:env});
    }
  }

  componentWillMount(){
    this.updateDimensions();
  }

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
  }

  componentWillUnmount(){
    window.removeEventListener("resize", this.updateDimensions);
  }

  updateDimensions(){
    const device = appHelpers.getDeviceWidth(window.innerWidth);
    this.setState({device:device});
  }

  render(){
    let homePageDisplay;
    if (this.state.products){
      homePageDisplay = (
        <div className="hp-wrapper">
          <Introduction device={this.state.device}/>
          <NewProducts
            device={this.state.device}
            products={this.state.products.LatestProducts}
            env={this.state.env}
          />
          <TopAppsProducts
            device={this.state.device}
            products={this.state.products.TopApps}
            env={this.state.env}
          />
          <TopGamesProducts
            device={this.state.device}
            products={this.state.products.TopGames}
            env={this.state.env}
          />
        </div>
      )
    }

    return (
      <div id="homepage-version-one">
        {homePageDisplay}
      </div>
    )
  }
}

const mapStateToHomePageProps = (state) => {
  const products = state.products;
  const domain = state.domain;
  return {
    products,
    domain
  }
}

const mapDispatchToHomePageProps = (dispatch) => {
  return {
    dispatch
  }
}

const HomePageWrapper = ReactRedux.connect(
  mapStateToHomePageProps,
  mapDispatchToHomePageProps
)(HomePageTemplateOne);

class Introduction extends React.Component {
  render(){
    return (
      <div id="introduction" className="hp-section">
        <div className="container">
          <article>
            <h2 className="mdl-color-text--primary">Welcome to AppImageHub</h2>
            <p>
              AppImages are self-contained apps which can simply be downloaded & run on any Linux distribution. For easy usage, download AppImageLauncher:
            </p>
            <div className="actions">
              <a href="https://www.appimagehub.com/p/1228228" className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored mdl-color--primary">
                -> AppImageLauncher
              </a>
              <a href="https://www.appimagehub.com/browse" className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored mdl-color--primary">Browse all apps</a>
            </div>
          </article>
        </div>
      </div>
    )
  }
}

class NewProducts extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {};
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.products && !this.state.products){
      products = nextProps.products.LatestProducts;
      this.setState({products:products});
    }
  }

  render(){
    let latestProducts;
    if (this.props.products){
      let baseUrl;
      if (this.props.env === 'live') {
        baseUrl = 'cn.pling.com';
      } else {
        baseUrl = 'cn.pling.it';
      }
      const limit = appHelpers.getNumberOfProducts(this.props.device);
      latestProducts = this.props.products.slice(0,limit).map((product,index) => (
        <div key={index} className="product square">
            <div className="content">
              <div className="product-wrapper mdl-shadow--2dp">
                <a href={"/p/"+product.project_id}>
                  <div className="product-image-container">
                    <figure>
                      <img className="very-rounded-corners" src={'https://' + baseUrl + '/cache/200x171/img/' + product.image_small} />
                    </figure>
                  </div>
                  <div className="product-info">
                    <span className="product-info-title">{product.title}</span>
                    <span className="product-info-description">{product.description}</span>
                  </div>
                </a>
              </div>
          </div>
        </div>
      ));
    }


    return (
      <div id="latest-products" className="hp-section products-showcase">
        <div className="container">
          <div className="section-header">
            <h3  className="mdl-color-text--primary">New</h3>
            <div className="actions">
              <a href="https://www.appimagehub.com/browse/ord/latest/" className="mdl-button mdl-js-button mdl-button--colored mdl-button--raised mdl-js-ripple-effect mdl-color--primary">see more</a>
            </div>
          </div>
          <div className="products-container row">
            {latestProducts}
          </div>
        </div>
      </div>
    )
  }
}

class TopAppsProducts extends React.Component {
  render(){
    let topProducts;
    if (this.props.products){
      let baseUrl;
      if (this.props.env === 'live') {
        baseUrl = 'cn.pling.com';
      } else {
        baseUrl = 'cn.pling.it';
      }
      const limit = appHelpers.getNumberOfProducts(this.props.device);
      topProducts = this.props.products.slice(0,limit).map((product,index) => (
        <div key={index} className="product square">
            <div className="content">
              <div className="product-wrapper mdl-shadow--2dp">
                <a href={"/p/"+product.project_id}>
                  <div className="product-image-container">
                    <figure>
                      <img className="very-rounded-corners" src={'https://' + baseUrl + '/cache/200x171/img/' + product.image_small} />
                    </figure>
                  </div>
                  <div className="product-info">
                    <span className="product-info-title">{product.title}</span>
                    <span className="product-info-description">{product.description}</span>
                  </div>
                </a>
              </div>
          </div>
        </div>
      ));
    }
    return (
      <div id="hottest-products" className="hp-section products-showcase">
        <div className="container">
          <div className="section-header">
            <h3 className="mdl-color-text--primary">Top Apps</h3>
            <div className="actions">
              <a href="https://www.appimagehub.com/browse/ord/top/" className="mdl-button mdl-js-button mdl-button--colored mdl-button--raised mdl-js-ripple-effect mdl-color--primary">see more</a>
            </div>
          </div>
          <div className="products-container row">
            {topProducts}
          </div>
        </div>
      </div>
    )
  }
}

class TopGamesProducts extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {};
  }

  render(){

    let topProducts;
    if (this.props.products){
      let baseUrl;
      if (this.props.env === 'live') {
        baseUrl = 'cn.pling.com';
      } else {
        baseUrl = 'cn.pling.it';
      }
      const limit = appHelpers.getNumberOfProducts(this.props.device);
      topProducts = this.props.products.slice(0,limit).map((product,index) => (
        <div key={index} className="product square">
            <div className="content">
              <div className="product-wrapper mdl-shadow--2dp">
                <a href={"/p/"+product.project_id}>
                  <div className="product-image-container">
                    <figure className="no-padding">
                      <img className="very-rounded-corners" src={'https://' + baseUrl + '/cache/200x171/img/' + product.image_small} />
                    </figure>
                  </div>
                  <div className="product-info">
                    <span className="product-info-title">{product.title}</span>
                    <span className="product-info-description">{product.description}</span>
                  </div>
                </a>
              </div>
          </div>
        </div>
      ));
    }
    return (
      <div id="hottest-products" className="hp-section products-showcase">
        <div className="container">
          <div className="section-header">
            <h3 className="mdl-color-text--primary">Top Games</h3>
            <div className="actions">
              <a href="https://www.appimagehub.com/browse/cat/6/ord/latest/" className="mdl-button mdl-js-button mdl-button--colored mdl-button--raised mdl-js-ripple-effect mdl-color--primary">see more</a>
            </div>
          </div>
          <div className="products-container row">
            {topProducts}
          </div>
        </div>
      </div>
    )
  }
}
