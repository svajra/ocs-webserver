window.appHelpers = function () {

  function getHostNameSuffix() {
    let hostNameSuffix = "org";
    if (location.hostname.endsWith('cc')) {
      hostNameSuffix = "cc";
    } else if (location.hostname.endsWith('localhost')) {
      hostNameSuffix = "localhost";
    }
    return hostNameSuffix;
  }

  function generateTabsMenuArray() {
    const baseUrl = "https://www.opendesktop." + this.getHostNameSuffix();
    const tabsMenuArray = [{
      title: "Supporters",
      url: baseUrl + "/community/getjson?e=supporters"
    }, {
      title: "Most plinged Creators",
      url: baseUrl + "/community/getjson?e=mostplingedcreators"
    }, {
      title: "Most plinged Products",
      url: baseUrl + "/community/getjson?e=mostplingedproducts"
    }, {
      title: "Recently plinged Products",
      url: baseUrl + "/community/getjson?e=plingedprojects"
    }, {
      title: "New Members",
      url: baseUrl + "/community/getjson?e=newmembers"
    }, {
      title: "Top Members",
      url: baseUrl + "/community/getjson?e=topmembers"
    }, {
      title: "Top List Members",
      url: baseUrl + "/community/getjson?e=toplistmembers"
    }];
    return tabsMenuArray;
  }

  return {
    getHostNameSuffix,
    generateTabsMenuArray
  };
}();

class CommunityPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      headerData: window.json_data.data
    };
  }

  componentDidMount() {
    console.log(this.state);
    /*
      var json_data = <?=json_encode($this->json_data)?>; hier bekommest du die oberteil info
      tabs info top members https://www.opendesktop.cc
      hier ist supporters https://www.opendesktop.cc/community/getjson?e=supporters
      alle tab events sind hier. /var/www/ocs-webserver/application/modules/default/controllers/CommunityController.php
      getjsonAction
    */
  }

  render() {
    return React.createElement(
      "div",
      { id: "community-page" },
      React.createElement(
        "div",
        { className: "container" },
        React.createElement(CommunityPageHeader, {
          headerData: this.state.headerData
        }),
        React.createElement(CommunityPageTabsContainer, null)
      )
    );
  }
}

class CommunityPageHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return React.createElement(
      "div",
      { id: "community-page-header" },
      React.createElement(
        "h1",
        null,
        "Community"
      ),
      React.createElement(
        "div",
        { id: "community-page-header-banner" },
        React.createElement(
          "div",
          { className: "header-banner-row" },
          React.createElement(
            "p",
            null,
            this.props.headerData.countActiveMembers
          ),
          React.createElement(
            "span",
            null,
            "contributors added"
          )
        ),
        React.createElement(
          "div",
          { className: "header-banner-row" },
          React.createElement(
            "p",
            null,
            this.props.headerData.countProjects
          ),
          React.createElement(
            "span",
            null,
            "products"
          )
        ),
        React.createElement(
          "div",
          { id: "header-banner-bottom" },
          React.createElement(
            "div",
            { className: "center" },
            React.createElement(
              "a",
              { href: "/register" },
              "Register"
            ),
            React.createElement(
              "span",
              null,
              "to join the community"
            )
          )
        )
      )
    );
  }
}

class CommunityPageTabsContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      tabs: []
    };
    this.renderTabs = this.renderTabs.bind(this);
    this.handleTabMenuItemClick = this.handleTabMenuItemClick.bind(this);
  }

  componentDidMount() {
    this.renderTabs();
  }

  renderTabs(selectedIndex) {
    if (!selectedIndex) {
      selectedIndex = 0;
    }
    const tabs = window.appHelpers.generateTabsMenuArray();
    this.setState({
      tabs: tabs,
      selectedIndex: selectedIndex
    }, function () {
      // get selected tab thing
      const self = this;
      const selectedTab = self.state.tabs[self.state.selectedIndex];
      $.ajax({ url: selectedTab.url, cache: false }).done(function (response) {
        console.log(response);
        self.setState({
          tabContent: {
            title: selectedTab.title,
            data: response
          },
          loading: false
        });
      });
    });
  }

  handleTabMenuItemClick(itemIndex) {
    this.renderTabs(itemIndex);
  }

  render() {
    console.log(this.state);
    let tabsMenu, tabContent;
    if (this.state.loading === false) {

      const selectedIndex = this.state.selectedIndex;
      const tabsMenuDisplay = this.state.tabs.map((t, index) => React.createElement(CommunityPageTabMenuItem, {
        key: index,
        index: index,
        selectedIndex: selectedIndex,
        tab: t,
        onTabMenuItemClick: this.handleTabMenuItemClick
      }));
      tabsMenu = React.createElement(
        "ul",
        null,
        tabsMenuDisplay
      );

      const data = this.state.tabContent.data;
      if (this.state.selectedIndex === 0) {
        tabContent = React.createElement(SupportersTab, {
          items: data
        });
      } else if (this.state.selectedIndex === 1) {
        tabContent = React.createElement(MostPlingedCreatorsTab, {
          items: data
        });
      }
    }

    return React.createElement(
      "div",
      { id: "community-page-tabs-container" },
      React.createElement(
        "div",
        { id: "tabs-menu" },
        tabsMenu
      ),
      React.createElement(
        "div",
        { id: "tabs-content" },
        tabContent
      )
    );
  }
}

class CommunityPageTabMenuItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.onTabMenuItemClick = this.onTabMenuItemClick.bind(this);
  }

  onTabMenuItemClick() {
    this.props.onTabMenuItemClick(this.props.index);
  }

  render() {
    return React.createElement(
      "li",
      null,
      React.createElement(
        "a",
        { onClick: this.onTabMenuItemClick },
        this.props.tab.title
      )
    );
  }
}

class SupportersTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    console.log('supporters tab');
  }

  render() {

    const supportersDisplay = this.props.items.map((supporter, index) => React.createElement(CommunityListItem, {
      key: index,
      item: supporter,
      type: 'supporter'
    }));

    return React.createElement(
      "div",
      { className: "community-tab", id: "supporters-tab" },
      supportersDisplay
    );
  }
}

class MostPlingedCreatorsTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    console.log('most plinged creators tab');
  }

  render() {

    const creatorsDisplay = this.props.items.map((creator, index) => React.createElement(CommunityListItem, {
      key: index,
      item: creator,
      type: 'creator'
    }));

    return React.createElement(
      "div",
      { className: "community-tab", id: "most-pling-creators-tab" },
      creatorsDisplay
    );
  }
}

class CommunityListItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    let i = this.props.item;
    let specificInfoDisplay;
    if (this.props.type === 'supporter') {
      specificInfoDisplay = React.createElement(
        "li",
        null,
        "supporter id : ",
        i.supporter_id
      );
    } else if (this.props.type) {
      specificInfoDisplay = React.createElement(
        "li",
        null,
        "cnt : ",
        i.cnt
      );
    }
    return React.createElement(
      "div",
      { className: "supporter-list-item" },
      React.createElement(
        "ul",
        null,
        React.createElement(
          "li",
          null,
          "member id : ",
          i.member_id
        ),
        React.createElement(
          "li",
          null,
          "username : ",
          i.username
        ),
        React.createElement(
          "li",
          null,
          "profile_image_url : ",
          i.profile_image_url
        ),
        React.createElement(
          "li",
          null,
          "created at : ",
          i.created_at
        ),
        specificInfoDisplay
      )
    );
  }
}

ReactDOM.render(React.createElement(CommunityPage, null), document.getElementById('community-page-container'));
