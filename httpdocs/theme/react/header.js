class SiteHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      baseUrl: window.json_baseurl,
      cat_title: window.json_cat_title,
      hasIdentity: window.json_hasIdentity,
      is_show_title: window.json_is_show_title,
      redirectString: window.json_redirectString,
      serverUrl: window.json_serverUrl,
      serverUri: window.json_serverUri,
      store: {
        sName: window.json_sname,
        name: window.json_store_name,
        order: window.json_store_order,
        last_char_store_order: window.last_char_store_order
      },
      user: window.json_member,
      logo: window.json_logoWidth,
      cat_title_left: window.json_cat_title_left,
      tabs_left: window.tabs_left
    };
  }

  componentDidMount() {
    console.log(this.state);
  }

  render() {
    return React.createElement(
      "section",
      { id: "site-header" },
      React.createElement(SiteHeaderLogoContainer, {
        serverUrl: this.state.serverUrl,
        serverUri: this.state.serverUri
      })
    );
  }
}

class SiteHeaderLogoContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return React.createElement(
      "div",
      { id: "site-header-logo-container" },
      React.createElement("a", { href: this.props.serverUrl + this.props.serverUri })
    );
  }
}

ReactDOM.render(React.createElement(SiteHeader, null), document.getElementById('site-header-container'));
