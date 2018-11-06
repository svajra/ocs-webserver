 class MetaHeader extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
      domains:window.domains,
      baseUrl:window.baseUrl,
      blogUrl:window.blogUrl,
      forumUrl:window.forumUrl,
      loginUrl:window.loginUrl,
      logoutUrl:window.logoutUrl,
      gitlabUrl:window.gitlabUrl,
      sName:window.sName,
      user:{},
    };
    this.initMetaHeader = this.initMetaHeader.bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);
    this.getUser = this.getUser.bind(this);
  }


  componentWillMount() {
    this.updateDimensions();
  }

  componentDidMount() {
    this.initMetaHeader();
  }

  componentWillUnmount(){
    window.removeEventListener("resize", this.updateDimensions);
  }

  initMetaHeader(){
    window.addEventListener("resize", this.updateDimensions);
    this.getUser();
  }

  getUser(){
    const decodedCookie = decodeURIComponent(document.cookie);
    let ocs_data = decodedCookie.split('ocs_data=')[1];
    if (ocs_data){
      if (ocs_data.indexOf(';') > -1){ ocs_data = ocs_data.split(';')[0]; }
      const user = JSON.parse(ocs_data);
      this.setState({user:user});
    }
  }


    updateDimensions(){
      const width = window.innerWidth;
      let device;
      if (width >= 910){
        device = "large";
      } else if (width < 910 && width >= 610){
        device = "mid";
      } else if (width < 610){
        device = "tablet";
      }
      this.setState({device:device});
    }

  render(){
    let domainsMenuDisplay;
    if (this.state.device === "tablet"){
      domainsMenuDisplay = (
        <MobileLeftMenu
          device={this.state.device}
          domains={domains}
          user={this.state.user}
          baseUrl={this.state.baseUrl}
          blogUrl={this.state.blogUrl}
          forumUrl={this.state.forumUrl}
          sName={this.state.sName}
        />
      )
    } else {
      domainsMenuDisplay = (
        <DomainsMenu
          device={this.state.device}
          domains={domains}
          user={this.state.user}
          baseUrl={this.state.baseUrl}
          blogUrl={this.state.blogUrl}
          forumUrl={this.state.forumUrl}
          sName={this.state.sName}
        />
      )
    }
    return (
      <nav id="metaheader-nav" className="metaheader">
        <div className="metamenu">
          {domainsMenuDisplay}
          <UserMenu
            device={this.state.device}
            user={this.state.user}
            baseUrl={this.state.baseUrl}
            blogUrl={this.state.blogUrl}
            forumUrl={this.state.forumUrl}
            loginUrl={this.state.loginUrl}
            logoutUrl={this.state.logoutUrl}
            gitlabUrl={this.state.gitlabUrl}
          />
        </div>
      </nav>
    )
  }
}

class DomainsMenu extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
    };
  }

  render(){

    let moreMenuItemDisplay;
    if (this.props.device !== "large"){
      moreMenuItemDisplay = (
        <MoreDropDownMenu
          domains={this.props.domains}
          baseUrl={this.props.baseUrl}
          blogUrl={this.props.blogUrl}
        />
      )
    }

    return (
      <ul className="metaheader-menu left" id="domains-menu">
        <li className="active">
          <a href={this.props.baseUrl}>
            <img src={this.props.baseUrl + "/images/system/ocs-logo-rounded-16x16.png"} className="logo"/>
            openDesktop.org :
          </a>
        </li>
        <DomainsDropDownMenu
          domains={this.props.domains}
        />
        <DiscussionBoardsDropDownMenu
          forumUrl={this.props.forumUrl}
        />
        {moreMenuItemDisplay}
      </ul>
    )
  }
}

class DomainsDropDownMenu extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {};
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    let menuGroups = [];
    this.props.domains.forEach(function(domain,index){
      if (menuGroups.indexOf(domain.menugroup) === -1){
        menuGroups.push(domain.menugroup);
      }
    });
    this.setState({menuGroups:menuGroups});
  }

  componentWillMount() {
    document.addEventListener('mousedown',this.handleClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown',this.handleClick, false);
  }

  handleClick(e){
    let dropdownClass = "";
    if (this.node.contains(e.target)){
      if (this.state.dropdownClass === "open"){
        if (e.target.className === "domains-menu-link-item"){
          dropdownClass = "";
        } else {
          dropdownClass = "open";
        }
      } else {
        dropdownClass = "open";
      }
    }
    this.setState({dropdownClass:dropdownClass});
  }

  render(){

    let menuGroupsDisplayLeft, menuGroupsDisplayRight;
    if (this.state.menuGroups){
      menuGroupsDisplayLeft = this.state.menuGroups.slice(0,2).map((mg,i) => (
        <DomainsMenuGroup
          key={i}
          domains={this.props.domains}
          menuGroup={mg}
          sName={this.props.sName}
        />
      ));
      menuGroupsDisplayRight = this.state.menuGroups.slice(2).map((mg,i) => (
        <DomainsMenuGroup
          key={i}
          domains={this.props.domains}
          menuGroup={mg}
          sName={this.props.sName}
        />
      ));
    }

    return (
      <li ref={node => this.node = node} id="domains-dropdown-menu" className={this.state.dropdownClass}>
        <a className="domains-menu-link-item">Themes & Apps</a>
        <ul className="dropdown-menu dropdown-menu-right">
          <li className="submenu-container">
            <ul>
              {menuGroupsDisplayLeft}
            </ul>
          </li>
          <li className="submenu-container">
            <ul>
              {menuGroupsDisplayRight}
            </ul>
          </li>
        </ul>
      </li>
    );
  }
}

class DiscussionBoardsDropDownMenu extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {};
    this.handleClick = this.handleClick.bind(this);
  }

  componentWillMount() {
    document.addEventListener('mousedown',this.handleClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown',this.handleClick, false);
  }

  handleClick(e){
    let dropdownClass = "";
    if (this.node.contains(e.target)){
      if (this.state.dropdownClass === "open"){
        if (e.target.className === "discussion-menu-link-item"){
          dropdownClass = "";
        } else {
          dropdownClass = "open";
        }
      } else {
        dropdownClass = "open";
      }
    }
    this.setState({dropdownClass:dropdownClass});
  }

  render(){
    return (
      <li ref={node => this.node = node}  id="discussion-boards" className={this.state.dropdownClass}>
        <a className="discussion-menu-link-item">Discussion Boards</a>
        <ul className="discussion-menu dropdown-menu dropdown-menu-right">
          <li><a href={this.props.forumUrl + "/c/general"}>General</a></li>
          <li><a href={this.props.forumUrl + "/c/themes-and-apps"}>Themes & Apps</a></li>
          <li><a href={this.props.forumUrl + "/c/coding"}>Coding</a></li>
        </ul>
      </li>
    );
  }

}

class MoreDropDownMenu extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {};
    this.handleClick = this.handleClick.bind(this);
  }

  componentWillMount() {
    document.addEventListener('mousedown',this.handleClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown',this.handleClick, false);
  }

  handleClick(e){
    let dropdownClass = "";
    if (this.node.contains(e.target)){
      if (this.state.dropdownClass === "open"){
        if (e.target.className === "more-menu-link-item"){
          dropdownClass = "";
        } else {
          dropdownClass = "open";
        }
      } else {
        dropdownClass = "open";
      }
    }
    this.setState({dropdownClass:dropdownClass});
  }

  render(){

    let plingListUrl = "/#plingList",
        ocsapiContentUrl = "/#ocsapiContent",
        aboutContentUrl = "/#aboutContent",
        linkTarget = "_blank";
    if (window.location.hostname === this.props.baseUrl.split('https://')[1]){
      plingListUrl = "/plings";
      ocsapiContentUrl = "/partials/ocsapicontent.phtml";
      aboutContentUrl = "/partials/about.phtml";
      linkTarget = "";
    }

    return(
      <li ref={node => this.node = node} id="more-dropdown-menu" className={this.state.dropdownClass}>
        <a className="more-menu-link-item">More</a>
        <ul className="dropdown-menu">
          <li><a href={this.props.baseUrl + "/community"}>Community</a></li>
          <li><a href={this.props.blogUrl} target="_blank">Blog</a></li>
          <li><a id="plingList" className="popuppanel" target={linkTarget} href={this.props.baseUrl + plingListUrl}>What are Plings?</a></li>
          <li><a id="ocsapiContent" className="popuppanel" target={linkTarget} href={this.props.baseUrl + ocsapiContentUrl}>API</a></li>
          <li><a id="aboutContent" className="popuppanel" target={linkTarget} href={this.props.baseUrl + aboutContentUrl} >About</a></li>
        </ul>
      </li>
    )
  }
}

class DomainsMenuGroup extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {};
    this.filterDomainsByMenuGroup = this.filterDomainsByMenuGroup.bind(this);
  }

  filterDomainsByMenuGroup(domain){
    if (domain.menugroup === this.props.menuGroup){
      return domain;
    }
  }

  render(){
      const domainsDisplay = this.props.domains.filter(this.filterDomainsByMenuGroup).map((domain,index) => {
        let domainPrefix = "";
        if (domain.menuhref.indexOf('https://') === -1 && domain.menuhref.indexOf('http://') === -1){
          domainPrefix += "http://";
        }
        return (
          <li key={index}>
            <a href={domainPrefix + domain.menuhref}>{domain.name}</a>
          </li>
        );
      });

    return (
      <li>
        <a className="groupname"><b>{this.props.menuGroup}</b></a>
        <ul className="domains-sub-menu">
          {domainsDisplay}
        </ul>
      </li>
    )
  }
}

class UserMenu extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {};
  }

  render(){
    let userDropdownDisplay, userAppsContextDisplay;
    if (this.props.user && this.props.user.member_id){
      userDropdownDisplay = (
        <UserLoginMenuContainer
          user={this.props.user}
          logoutUrl={this.props.logoutUrl}
          baseUrl={this.props.baseUrl}
        />
      );
      userAppsContextDisplay = (
        <UserContextMenuContainer
          user={this.props.user}
          forumUrl={this.props.forumUrl}
          gitlabUrl={this.props.gitlabUrl}
        />
      )
    } else {
      userDropdownDisplay = (
        <li id="user-login-container"><a href={this.props.loginUrl} className="btn btn-metaheader">Login</a></li>
      )
    }

    let userMenuContainerDisplay;
    if (this.props.device === "large"){

      let plingListUrl = "/#plingList",
          ocsapiContentUrl = "/#ocsapiContent",
          aboutContentUrl = "/#aboutContent",
          linkTarget = "_blank";
      if (window.location.hostname === this.props.baseUrl.split('https://')[1]){
        plingListUrl = "/plings";
        ocsapiContentUrl = "/partials/ocsapicontent.phtml";
        aboutContentUrl = "/partials/about.phtml";
        linkTarget = "";
      }

      userMenuContainerDisplay = (
        <ul className="metaheader-menu" id="user-menu">
          <li><a href={this.props.baseUrl + "/community"}>Community</a></li>
          <li><a href={this.props.blogUrl} target="_blank">Blog</a></li>
          <li><a id="plingList" className="popuppanel" target={linkTarget} href={this.props.baseUrl + plingListUrl}>What are Plings?</a></li>
          <li><a id="ocsapiContent" className="popuppanel" target={linkTarget} href={this.props.baseUrl + ocsapiContentUrl}>API</a></li>
          <li><a id="aboutContent" className="popuppanel" target={linkTarget} href={this.props.baseUrl + aboutContentUrl} >About</a></li>
          {userAppsContextDisplay}
          {userDropdownDisplay}
        </ul>
      );
    } else {
      userMenuContainerDisplay = (
        <ul className="metaheader-menu" id="user-menu">
          {userAppsContextDisplay}
          {userDropdownDisplay}
        </ul>
      );
    }


    return (
      <div id="user-menu-container" className="right">
        {userMenuContainerDisplay}
      </div>
    )
  }
}

class UserContextMenuContainer extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
      gitlabLink:window.gitlabUrl+"/dashboard/issues?assignee_id="
    };
    this.handleClick = this.handleClick.bind(this);
  }

  componentWillMount() {
    document.addEventListener('mousedown',this.handleClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown',this.handleClick, false);
  }

  componentDidMount() {
    const self = this;
    $.ajax({url: window.gitlabUrl+"/api/v4/users?username="+this.props.user.username,cache: false})
      .done(function(response){
        const gitlabLink = self.state.gitlabLink + response[0].id;
        self.setState({gitlabLink:gitlabLink,loading:false});
    });
  }

  handleClick(e){
    let dropdownClass = "";
    if (this.node.contains(e.target)){
      if (this.state.dropdownClass === "open"){
        if (e.target.className === "th-icon" || e.target.className === "btn btn-default dropdown-toggle"){
          dropdownClass = "";
        } else {
          dropdownClass = "open";
        }
      } else {
        dropdownClass = "open";
      }
    }
    this.setState({dropdownClass:dropdownClass});
  }

  render(){

    return (
      <li ref={node => this.node = node} id="user-context-menu-container">
        <div className={"user-dropdown " + this.state.dropdownClass}>
          <button
            className="btn btn-default dropdown-toggle" type="button" onClick={this.toggleDropDown}>
            <span className="th-icon"></span>
          </button>
          <ul id="user-context-dropdown" className="dropdown-menu dropdown-menu-right">
            <li id="opencode-link-item">
              <a href={this.props.gitlabUrl+"/dashboard/projects"}>
                <div className="icon"></div>
                <span>Projects</span>
              </a>
            </li>
            <li id="issues-link-item">
              <a href={this.state.gitlabLink}>
                <div className="icon"></div>
                <span>Issues</span>
              </a>
            </li>
            <li id="messages-link-item">
              <a href={this.props.forumUrl+"/u/"+this.props.user.username+"/messages"}>
                <div className="icon"></div>
                <span>Messages</span>
              </a>
            </li>
          </ul>
        </div>
      </li>
    )
  }
}

class UserLoginMenuContainer extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {};
    this.handleClick = this.handleClick.bind(this);
  }

  componentWillMount() {
    document.addEventListener('mousedown',this.handleClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown',this.handleClick, false);
  }

  handleClick(e){
    let dropdownClass = "";
    if (this.node.contains(e.target)){
      if (this.state.dropdownClass === "open"){
        if (e.target.className === "th-icon" || e.target.className === "btn btn-default dropdown-toggle"){
          dropdownClass = "";
        } else {
          dropdownClass = "open";
        }
      } else {
        dropdownClass = "open";
      }
    }
    this.setState({dropdownClass:dropdownClass})
  }


  render(){
    return (
      <li id="user-login-menu-container" ref={node => this.node = node}>
        <div className={"user-dropdown " + this.state.dropdownClass}>
          <button
            className="btn btn-default dropdown-toggle"
            type="button"
            id="userLoginDropdown">
            <img className="th-icon" src={this.props.user.avatar}/>
          </button>
          <ul className="dropdown-menu dropdown-menu-right">
            <li id="user-info-menu-item">
              <div id="user-info-section">
                <div className="user-avatar">
                  <div className="no-avatar-user-letter">
                    <img src={this.props.user.avatar}/>
                  </div>
                </div>
                <div className="user-details">
                  <ul>
                    <li><b>{this.props.user.username}</b></li>
                    <li>{this.props.user.mail}</li>
                  </ul>
                </div>
              </div>
            </li>
            <li className="buttons">
              <a href={this.props.baseUrl + "/settings/"} className="btn btn-default btn-metaheader">Settings</a>
              <a href={this.props.logoutUrl} className="btn btn-default pull-right btn-metaheader">Logout</a>
            </li>
          </ul>
        </div>
      </li>
    )
  }
}

/** MOBILE SPECIFIC **/

class MobileLeftMenu extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
      overlayClass:""
    };
    this.toggleLeftSideOverlay = this.toggleLeftSideOverlay.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentWillMount() {
    window.addEventListener('mousedown',this.handleClick, false);
    window.addEventListener('touchend', this.handleClick, false);
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown',this.handleClick, false);
    window.addEventListener('touchend', this.handleClick, false);
  }

  toggleLeftSideOverlay(){
    let overlayClass = "open";
    if (this.state.overlayClass === "open") {
      overlayClass = "";
    }
    this.setState({overlayClass:overlayClass});
  }

  handleClick(e){
    let overlayClass = "";
    if (this.node.contains(e.target)){
      if (this.state.overlayClass === "open"){
        if (e.target.id === "left-side-overlay" || e.target.id === "menu-toggle-item"){
          overlayClass = "";
        } else {
          overlayClass = "open";
        }
      } else {
        overlayClass = "open";
      }
    }
    this.setState({overlayClass:overlayClass});
  }

  render(){
    return (
      <div ref={node => this.node = node}  id="metaheader-left-mobile" className={this.state.overlayClass}>
        <a className="menu-toggle" id="menu-toggle-item"></a>
        <div id="left-side-overlay">
          <MobileLeftSidePanel
            baseUrl={this.props.baseUrl}
            domains={this.props.domains}
            baseUrl={this.props.baseUrl}
            blogUrl={this.props.blogUrl}
            forumUrl={this.props.forumUrl}
          />
        </div>
      </div>
    );
  }
}

class MobileLeftSidePanel extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {};
  }

  componentDidMount() {
    let menuGroups = [];
    this.props.domains.forEach(function(domain,index){
      if (menuGroups.indexOf(domain.menugroup) === -1){
        menuGroups.push(domain.menugroup);
      }
    });
    this.setState({menuGroups:menuGroups});
  }

  render(){
    let panelMenuGroupsDisplay;
    if (this.state.menuGroups){
      panelMenuGroupsDisplay = this.state.menuGroups.map((mg,i) => (
        <DomainsMenuGroup
          key={i}
          domains={this.props.domains}
          menuGroup={mg}
          sName={this.props.sName}
        />
      ));
    }

    let plingListUrl = "/#plingList",
        ocsapiContentUrl = "/#ocsapiContent",
        aboutContentUrl = "/#aboutContent",
        linkTarget = "_blank";
    if (window.location.hostname === this.props.baseUrl.split('https://')[1]){
      plingListUrl = "/plings";
      ocsapiContentUrl = "/partials/ocsapicontent.phtml";
      aboutContentUrl = "/partials/about.phtml";
      linkTarget = "";
    }

    return (
      <div id="left-side-panel">
        <div id="panel-header">
          <a href={this.props.baseUrl}>
            <img src={this.props.baseUrl + "/images/system/opendesktop-logo.png"} className="logo"/> openDesktop.org
          </a>
        </div>
        <div id="panel-menu">
          <ul>
            {panelMenuGroupsDisplay}
            <li>
              <a className="groupname"><b>Discussion Boards</b></a>
              <ul>
                <li><a href={this.props.forumUrl + "/c/general"}>General</a></li>
                <li><a href={this.props.forumUrl + "/c/themes-and-apps"}>Themes & Apps</a></li>
                <li><a href={this.props.forumUrl + "/c/coding"}>Coding</a></li>
              </ul>
            </li>
            <li>
              <a className="groupname"><b>More</b></a>
              <ul>
                <li><a href={this.props.baseUrl + "/community"}>Community</a></li>
                <li><a href={this.props.blogUrl} target="_blank">Blog</a></li>
                <li><a id="plingList" className="popuppanel" target={linkTarget} href={this.props.baseUrl + plingListUrl}>What are Plings?</a></li>
                <li><a id="ocsapiContent" className="popuppanel" target={linkTarget} href={this.props.baseUrl + ocsapiContentUrl}>API</a></li>
                <li><a id="aboutContent" className="popuppanel" target={linkTarget} href={this.props.baseUrl + aboutContentUrl} >About</a></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    )
  }
}

ReactDOM.render(
    <MetaHeader />,
    document.getElementById('metaheader')
);
