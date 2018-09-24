class HomePage extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
      device:store.getState().device,
      products:store.getState().products
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.device){
      this.setState({device:nextProps.device});
    }
    if (nextProps.products){
      this.setState({products:nextProps.products});
    }
  }

  render(){
    return (
      <div id="homepage">
        <div className="hp-wrapper">
          <HpIntroSectionWrapper />
          <div className="section">
            <div className="container">
              <ProductGroup
                products={this.state.products.LatestProducts}
                device={this.state.device}
                numRows={1}
                title={'New'}
                link={'/browse/ord/latest/'}
              />
            </div>
          </div>
          <div className="section">
            <div className="container">
              <ProductGroup
                products={this.state.products.TopApps}
                device={this.state.device}
                numRows={1}
                title={'Top Apps'}
                link={'/browse/ord/top/'}
              />
            </div>
          </div>
          <div className="section">
            <div className="container">
              <ProductGroup
                products={this.state.products.TopGames}
                device={this.state.device}
                numRows={1}
                title={'Top Games'}
                link={'/browse/cat/6/ord/top/'}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToHomePageProps = (state) => {
  const device = state.device;
  const products = state.products;
  return {
    device,
    products
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
)(HomePage);

class Introduction extends React.Component {
  render(){
    return (
      <div id="introduction" className="section">
        <div className="container">
          <article>
            <h2 className="mdl-color-text--primary">Welcome to AppImageHub</h2>
            <p>
              AppImages are self-contained apps which can simply be downloaded & run on any Linux distribution. For easy integration, download AppImageLauncher:
            </p>
            <div className="actions">
              <a href="/p/1228228" className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored mdl-color--primary">
                <img src="/theme/react/assets/img/icon-download_white.png"/> AppImageLauncher
              </a>
              <a href="/browse" className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored mdl-color--primary">Browse all apps</a>
            </div>
          </article>
        </div>
      </div>
    )
  }
}

class HpIntroSection extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {};
  }
  render(){
    return (
      <div id="homepage-search-container" className="section intro">
        <div className="container">
          <article>
            <p>Search thousands of snaps used by millions of people across 50 Linux distributions</p>
          </article>
          <form className="ui form">
            <div className="field">

            </div>
            <select className="ui fluid dropdown">
              <option>categories</option>
            </select>
            <input type="text"/>
            <button className="ui button">search</button>
          </form>
        </div>
      </div>
    )
  }
}

const mapStateToHpIntroSectionProps = (state) => {
  const categories = state.categories;
  return {
    categories
  }
}

const mapDispatchToHpIntroSectionProps = (dispatch) => {
  return {
    dispatch
  }
}

const HpIntroSectionWrapper = ReactRedux.connect(
  mapStateToHpIntroSectionProps,
  mapDispatchToHpIntroSectionProps
)(HpIntroSection);
