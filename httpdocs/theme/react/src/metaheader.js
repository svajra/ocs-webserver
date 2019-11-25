//import '@babel/polyfill';
import "core-js/shim";
import "regenerator-runtime/runtime";
import '@webcomponents/custom-elements'
import React from 'react';
import ReactDOM from 'react-dom';

// Use this object for config data instead of window.domains,
// window.baseUrl, window.etc... so don't set variables in global scope.
// Please see initConfig()
let config = {};

async function initConfig(target,url_afterlogin) {
  // API https://www.opendesktop.org/home/metamenujs should send
  // JSON data with CORS.
  // Please see config-dummy.php.

  // Also this API call sends cookie of www.opendesktop.org/cc
  // by fetch() with option "credentials: 'include'", so
  // www.opendesktop.org/cc possible detect user session.
  // Can we consider if include user information into JSON data of
  // API response instead of cookie set each external site?

  let url = `https://www.opendesktop.org/home/metamenubundlejs?target=${target}`;

  if (location.hostname.endsWith('cc')) {
    url = `https://www.opendesktop.cc/home/metamenubundlejs?target=${target}`;
  }
  else if (location.hostname.endsWith('localhost')) {
    url = `http://localhost:${location.port}/config-dummy.php`;
  }
  else if (location.hostname.endsWith('pling.local')) {
    url = `http://pling.local/home/metamenubundlejs?target=${target}`;
  }

  if(url_afterlogin)
  {
    url = url+`&url=${url_afterlogin}`;
  }

  try {
    const response = await fetch(url, {
      mode: 'cors',
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Network response error');
    }
    config = await response.json();
    return true;
  }
  catch (error) {
    console.error(error);
    return false;
  }
}

window.appHelpers = function () {

  function generateMenuGroupsArray(domains) {
    let menuGroups = [];
    domains.forEach(function (domain, index) {
      if (menuGroups.indexOf(domain.menugroup) === -1) {
        menuGroups.push(domain.menugroup);
      }
    });
    return menuGroups;
  }

  function getDeviceFromWidth(width) {
    let device;
    if (width >= 910) {
      device = "large";
    } else if (width < 910 && width >= 610) {
      device = "mid";
    } else if (width < 610) {
      device = "tablet";
    }
    return device;
  }

  function generatePopupLinks() {

    let pLink = {};
    pLink.plingListUrl = "/#plingList", pLink.ocsapiContentUrl = "/#ocsapiContent", pLink.aboutContentUrl = "/#aboutContent", pLink.linkTarget = "_blank";

    if (window.location.hostname.indexOf('opendesktop') === -1 || window.location.hostname === "opencode.net" || window.location.hostname === "git.opendesktop.cc" || window.location.hostname === "forum.opendesktop.org" || window.location.hostname === "forum.opendesktop.cc" || window.location.hostname === "my.opendesktop.org" || window.location.hostname === "my.opendesktop.cc") {
      pLink.plingListUrl = "/plings";
      pLink.ocsapiContentUrl = "/partials/ocsapicontent.phtml";
      pLink.aboutContentUrl = "/partials/about.phtml";
      pLink.linkTarget = "";
    }
    return pLink;
  }

  function getPopupUrl(key, isExternal, baseUrl) {
    let url = baseUrl;
    return url;
  }

  return {
    generateMenuGroupsArray,
    getDeviceFromWidth,
    generatePopupLinks,
    getPopupUrl
  };
}();

class MetaHeader extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      domains:config.domains,
      baseUrl:config.baseUrl,
      blogUrl:config.blogUrl,
      forumUrl:config.forumUrl,
      loginUrl:config.loginUrl,
      logoutUrl:config.logoutUrl,
      gitlabUrl:config.gitlabUrl,
      sName:config.sName,
      isExternal:config.isExternal,
      user:config.user,
      showModal:false,
      modalUrl:'',
      metamenuTheme:config.metamenuTheme,
      isAdmin:config.json_isAdmin
    };
    this.initMetaHeader = this.initMetaHeader.bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);
    this.onSwitchStyle = this.onSwitchStyle.bind(this);

    //this.getUser = this.getUser.bind(this);
  }


  componentWillMount() {
    this.updateDimensions();
  }

  componentDidMount() {
    this.initMetaHeader();
    //this.initMetamenuTheme();

  }

  componentWillUnmount(){
    window.removeEventListener("resize", this.updateDimensions);
    window.removeEventListener("orientationchange",this.updateDimensions);

  }

  initMetaHeader(){
    window.addEventListener("resize", this.updateDimensions);
    window.addEventListener("orientationchange",this.updateDimensions);
    //this.getUser();
  }

  fetchMetaheaderThemeSettings(){

     let url = 'https://www.opendesktop.org/membersetting/getsettings';
     if (location.hostname.endsWith('cc') || location.hostname.endsWith('local')) {
       url = 'https://www.opendesktop.cc/membersetting/getsettings';
     }

     fetch(url,{
                mode: 'cors',
                credentials: 'include'
                })
      .then(response => response.json())
      .then(data => {
        const results = data.results;
        if(results.length>0)
        {
          const theme = results.filter(r => r.member_setting_item_id == 1);
          if(theme.length>0 && theme[0].value==1)
          {
             this.setState({metamenuTheme:'metamenu-theme-dark'});
          }
        }
      });


  }

  // change metamenu class
  onSwitchStyle(evt){

     let url = 'https://www.opendesktop.org/membersetting/setsettings/itemid/1/itemvalue/';
     if (location.hostname.endsWith('cc') || location.hostname.endsWith('local')) {
       url = 'https://www.opendesktop.cc/membersetting/setsettings/itemid/1/itemvalue/';
     }
     url = url +(evt.target.checked?'1':'0');
     const isChecked = evt.target.checked;
     fetch(url,{
                mode: 'cors',
                credentials: 'include'
                })
      .then(response => response.json())
      .then(data => {
          this.setState({metamenuTheme:`${isChecked?'metamenu-theme-dark':''}`});
      });
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
    if (width >= 1015){
      device = "large";
    } else if (width < 1015 && width >= 730){
      device = "mid";
    } else if (width < 730){
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
          domains={this.state.domains}
          user={this.state.user}
          baseUrl={this.state.baseUrl}
          blogUrl={this.state.blogUrl}
          forumUrl={this.state.forumUrl}
          sName={this.state.sName}
          isAdmin={this.state.isAdmin}
          user={this.state.user}
          baseUrl={this.state.baseUrl}
          gitlabUrl={this.state.gitlabUrl}
        />
      )
    } else {
      domainsMenuDisplay = (
        <DomainsMenu
          device={this.state.device}
          domains={this.state.domains}
          user={this.state.user}
          baseUrl={this.state.baseUrl}
          blogUrl={this.state.blogUrl}
          forumUrl={this.state.forumUrl}
          sName={this.state.sName}
          isAdmin={this.state.isAdmin}
        />
      )
    }
    const metamenuCls = `metamenu ${this.state.metamenuTheme}`;
    let paraChecked = false;
    if(this.state.metamenuTheme){
        paraChecked=true;
    }
    return (
      <nav id="metaheader-nav" className="metaheader">
        <div style={{"display":"none"}} className={metamenuCls}>
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
            isAdmin={this.state.isAdmin}
            onSwitchStyle={this.onSwitchStyle}
            onSwitchStyleChecked={paraChecked}
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

    let moreMenuItemDisplay, adminsDropDownMenuDisplay, myOpendesktopMenuDisplay;
    if (this.props.device !== "large"){
      moreMenuItemDisplay = (
        <MoreDropDownMenu
          domains={this.props.domains}
          baseUrl={this.props.baseUrl}
          blogUrl={this.props.blogUrl}
          isAdmin={this.props.isAdmin}
          user={this.props.user}
          baseUrl={this.props.baseUrl}
          gitlabUrl={this.props.gitlabUrl}
        />
      )
    }

    return (
      <ul className="metaheader-menu left" id="domains-menu">
        <li className="active">
          <a id="opendesktop-logo" href={this.props.baseUrl}>
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
        <DevelopmentDropDownMenu
          user={this.props.user}
          baseUrl={this.props.baseUrl}
          gitlabUrl={this.props.gitlabUrl}
          isAdmin={this.props.isAdmin}
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
        <a className="domains-menu-link-item">Store Listings</a>
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
          <li><a href={this.props.forumUrl }>General</a></li>
          <li><a href={this.props.forumUrl + "/c/themes"}>Themes</a></li>
          <li><a href={this.props.forumUrl + "/c/apps"}>Apps</a></li>
          <li><a href={this.props.forumUrl + "/c/coding"}>Coding</a></li>
        </ul>
      </li>
    );
  }

}

class DevelopmentDropDownMenu extends React.Component {
  constructor(props){
    super(props);
    this.state = {};
    this.state = {
      gitlabLink:config.gitlabUrl+"/dashboard/issues?assignee_id="
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
    /*const self = this;
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        const res = JSON.parse(this.response);
        const gitlabLink = self.state.gitlabLink + res[0].id;
        self.setState({gitlabLink:gitlabLink,loading:false});
      }
    };
    xhttp.open("GET", config.gitlabUrl+"/api/v4/users?username="+this.props.user.username, true);
    xhttp.send();*/
  }

  handleClick(e){
    let dropdownClass = "";
    if (this.node.contains(e.target)){
      if (this.state.dropdownClass === "open"){
        if (e.target.className === "admins-menu-link-item"){
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
    let issuesMenuItem;
    if (this.props.isAdmin){
      issuesMenuItem = (
        <li><a href={config.gitlabUrl + "/dashboard/issues?milestone_title=No+Milestone&state=all"}>Issues</a></li>
      )
    }

    let gitfaqLinkItem;
    if (config.isExternal === false){
      gitfaqLinkItem = (<li><a className="popuppanel" id="gitfaq" href={"/gitfaq"}>Git FAQ</a></li>);
    } else {
      gitfaqLinkItem = (<li><a className="popuppanel" target="_blank" id="faq" href={config.baseUrl + "/#gitfaq"}>Git FAQ</a></li>);
    }

    return (
      <li ref={node => this.node = node} id="admins-dropdown-menu" className={this.state.dropdownClass}>
        <a className="admins-menu-link-item">Development</a>
        <ul className="dropdown-menu dropdown-menu-right">
          <li><a href={config.gitlabUrl + "/explore/projects"}>Projects</a></li>
          {issuesMenuItem}
          {gitfaqLinkItem}
        </ul>
      </li>
    )
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

    let faqLinkItem, apiLinkItem, aboutLinkItem;
    if (config.isExternal === false){
      faqLinkItem = (<li><a className="popuppanel" id="faq" href={"/plings"}>FAQ</a></li>);
      apiLinkItem = (<li><a className="popuppanel" id="api" href={"/partials/ocsapicontent.phtml"}>API</a></li>);
      aboutLinkItem = (<li><a className="popuppanel" id="about" href={"/partials/about.phtml"}>About</a></li>);
    } else {
      faqLinkItem = (<li><a className="popuppanel" target="_blank" id="faq" href={config.baseUrl + "/#faq"}>FAQ</a></li>);
      apiLinkItem = (<li><a className="popuppanel" target="_blank" id="api" href={config.baseUrl + "/#api"}>API</a></li>);
      aboutLinkItem = (<li><a className="popuppanel" target="_blank" id="about" href={config.baseUrl + "/#about"}>About</a></li>);
    }

    return(
      <li ref={node => this.node = node} id="more-dropdown-menu" className={this.state.dropdownClass}>
        <a className="more-menu-link-item">More</a>
        <ul className="dropdown-menu">
          <li><a href={this.props.baseUrl + "/community"}>Community</a></li>
          <li><a href={this.props.baseUrl + "/support"}>Support</a></li>
          <li><a href={this.props.blogUrl} target="_blank">Blog</a></li>
          {faqLinkItem}
          {apiLinkItem}
          {aboutLinkItem}
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

function SwitchItem(props){
  return(
    <div>
     <label className="switch">
     <input type="checkbox" checked={props.onSwitchStyleChecked} onChange={props.onSwitchStyle}/>
     <span className="slider round"></span>
     </label>
    </div>
  )
}

class UserMenu extends React.Component {
  constructor(props){
    super(props);
    this.state = {};
  }

  render(){
    let userDropdownDisplay, userAppsContextDisplay, developmentAppMenuDisplay;
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
          isAdmin={this.props.isAdmin}
        />
      );
      developmentAppMenuDisplay = (
        <DevelopmentAppMenu
          user={this.props.user}
          forumUrl={this.props.forumUrl}
          gitlabUrl={this.props.gitlabUrl}
          isAdmin={this.props.isAdmin}
          baseUrl={this.props.baseUrl}
        />
      );
    } else {
      userDropdownDisplay = (
        <li id="user-login-container"><a href={this.props.loginUrl} className="btn btn-metaheader">Login</a></li>
      )
    }

    let userMenuContainerDisplay;
    if (this.props.device === "large"){

      let faqLinkItem, apiLinkItem, aboutLinkItem;
      if (config.isExternal === false){
        faqLinkItem = (<li><a className="popuppanel" id="faq" href={"/plings"}>FAQ</a></li>);
        apiLinkItem = (<li><a className="popuppanel" id="api" href={"/partials/ocsapicontent.phtml"}>API</a></li>);
        aboutLinkItem = (<li><a className="popuppanel" id="about" href={"/partials/about.phtml"}>About</a></li>);
      } else {
        faqLinkItem = (<li><a className="popuppanel" target="_blank" id="faq" href={config.baseUrl + "/#faq"}>FAQ</a></li>);
        apiLinkItem = (<li><a className="popuppanel" target="_blank" id="api" href={config.baseUrl + "/#api"}>API</a></li>);
        aboutLinkItem = (<li><a className="popuppanel" target="_blank" id="about" href={config.baseUrl + "/#about"}>About</a></li>);
      }

      let switchItem;

      if (this.props.user && this.props.user.member_id && this.props.isAdmin){
      switchItem =(<li><SwitchItem onSwitchStyle={this.props.onSwitchStyle}
                  onSwitchStyleChecked={this.props.onSwitchStyleChecked}/></li>);
      }

      userMenuContainerDisplay = (
        <ul className="metaheader-menu" id="user-menu">
          <li><a href={this.props.baseUrl + "/community"}>Community</a></li>
          <li><a href={this.props.baseUrl + "/support"}>Support</a></li>
          <li><a href={this.props.blogUrl} target="_blank">Blog</a></li>
          {faqLinkItem}
          {apiLinkItem}
          {aboutLinkItem}
          {switchItem}
          {developmentAppMenuDisplay}
          {userAppsContextDisplay}
          {userDropdownDisplay}
        </ul>
      );
    } else {
      userMenuContainerDisplay = (
        <ul className="metaheader-menu" id="user-menu">
          {developmentAppMenuDisplay}
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
      gitlabLink:props.gitlabUrl+"/dashboard/issues?assignee_id="
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
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        const res = JSON.parse(this.response);
        const gitlabLink = self.state.gitlabLink + res[0].id;
        //const gitlabLink = self.state.gitlabLink;
        self.setState({gitlabLink:gitlabLink,loading:false});
      }
    };
    xhttp.open("GET", config.gitlabUrl+"/api/v4/users?username="+this.props.user.username, true);
    xhttp.send();
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

    /*
    // BU CODE

    */

    const urlEnding = config.baseUrl.split('opendesktop.')[1];

    let contextMenuDisplay;
   if (this.props.isAdmin){
      contextMenuDisplay = (
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

          <li id="chat-link-item" className="clear-left">
            <a href={"https://chat.opendesktop." + urlEnding}>
              <div className="icon"></div>
              <span>Chat</span>
            </a>
          </li>
          <li id="messages-link-item">
            <a href={this.props.forumUrl+"/u/"+this.props.user.username+"/messages"}>
              <div className="icon"></div>
              <span>Messages</span>
            </a>
          </li>
          <li id="contacts-link-item">
            <a href={"https://cloud.opendesktop." + urlEnding + "/index.php/apps/contacts/"}>
              <div className="icon"></div>
              <span>Contacts</span>
            </a>
          </li>

          <li id="storage-link-item">
            <a href={"https://cloud.opendesktop." + urlEnding}>
              <div className="icon"></div>
              <span>Storage</span>
            </a>
          </li>
          <li id="docs-link-item">
            <a href={"https://docs.opendesktop." + urlEnding}>
              <div className="icon"></div>
              <span>Docs</span>
            </a>
          </li>

          <li id="calendar-link-item">
            <a href={"https://cloud.opendesktop." + urlEnding + "/index.php/apps/calendar/"}>
              <div className="icon"></div>
              <span>Calendar</span>
            </a>
          </li>
          <li id="music-link-item">
            <a href={"https://music.opendesktop." + urlEnding}>
              <div className="icon"></div>
              <span>Music</span>
            </a>
          </li>

        </ul>
      );
    } else {
      contextMenuDisplay = (
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
          <li id="messages-link-item" className="clear-left">
            <a href={this.props.forumUrl+"/u/"+this.props.user.username+"/messages"}>
              <div className="icon"></div>
              <span>Messages</span>
            </a>
          </li>

        </ul>
      );
    }
    return (
      <li ref={node => this.node = node} id="user-context-menu-container">
        <div className={"user-dropdown " + this.state.dropdownClass}>
          <button
            className="btn btn-default dropdown-toggle" type="button" onClick={this.toggleDropDown}>
            <span className="th-icon"></span>
          </button>
          {contextMenuDisplay}
        </div>
      </li>
    )
  }
}

class DevelopmentAppMenu extends React.Component {
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

  componentDidMount() {   
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
      <li ref={node => this.node = node} id="development-app-menu-container">
        <div className={"user-dropdown " + this.state.dropdownClass}>
          <button
            className="btn btn-default dropdown-toggle" type="button" onClick={this.toggleDropDown}>
            <span className="th-icon"></span>
          </button>
          <ul id="user-context-dropdown" className="dropdown-menu dropdown-menu-right">
            <li id="addproduct-link-item">
              <a href={this.props.baseUrl+"/product/add"}>
                <div className="icon"></div>
                <span>Add Product</span>
              </a>
            </li>
            <li id="listproduct-link-item">
              <a href={this.props.baseUrl + "/u/" + this.props.user.username + "/products"}>
                <div className="icon"></div>
                <span>Products</span>
              </a>
            </li>
            <li id="plings-link-item">
              <a href={this.props.baseUrl + "/u/" + this.props.user.username + "/payout"}>
                <div className="icon"></div>
                <span>Payout</span>
              </a>
            </li>
          </ul>
        </div>
      </li>
    )
  }
}

class UserLoginMenuContainerVersionTwo extends React.Component {
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
    this.setState({dropdownClass:dropdownClass},function(){
      if (dropdownClass === "open"){
        $('body').addClass('drawer-open');
      } else {
        $('body').removeClass('drawer-open');
      }
    });
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
          <div id="background-overlay">
            <ul id="right-panel" className="dropdown-menu dropdown-menu-right">
              <li id="user-info-menu-item">
                <div id="user-info-section">
                  <div className="user-avatar">
                    <div className="no-avatar-user-letter">
                      <img src={this.props.user.avatar}/>
                    </div>
                  </div>
                  <div className="user-details">
                    <ul>
                      <li id="user-details-username"><h2>{this.props.user.username}</h2></li>
                      <li id="user-details-email">{this.props.user.mail}</li>
                      <li className="buttons">
                        <a href={this.props.baseUrl + "/settings/"} className="btn btn-default btn-metaheader"><span>Settings</span></a>
                        <a href={this.props.logoutUrl} className="btn btn-default pull-right btn-metaheader"><span>Logout</span></a>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
              <li id="user-tabs-menu-item">
                <UserTabs />
              </li>
            </ul>
          </div>
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
    this.setState({dropdownClass:dropdownClass});
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
                    <li id="user-details-username"><b>{this.props.user.username}</b></li>
                    <li id="user-details-email">{this.props.user.mail}</li>
                  </ul>
                </div>
              </div>
            </li>
            <li className="buttons">
              <a href={this.props.baseUrl + "/settings/"} className="btn btn-default btn-metaheader"><span>Settings</span></a>
              <a href={this.props.logoutUrl} className="btn btn-default pull-right btn-metaheader"><span>Logout</span></a>
            </li>
          </ul>
        </div>
      </li>
    )
  }
}

class UserTabs extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
      currentTab:'comments',
      searchPhrase:''
    };
    this.onTabMenuItemClick = this.onTabMenuItemClick.bind(this);
    this.onUserSearchInputChange = this.onUserSearchInputChange.bind(this);
    this.getUsersAutocompleteList = this.getUsersAutocompleteList.bind(this);
    this.selectUserFromAutocompleteList = this.selectUserFromAutocompleteList.bind(this);
  }

  onTabMenuItemClick(val){
    this.setState({currentTab:val});
  }

  onUserSearchInputChange(e){
    const searchPhrase = e.target.value;
    this.setState({searchPhrase:e.target.value},function(){
      let showUserList;
      if (searchPhrase.length > 2){
        showUserList = true;
      } else {
        showUserList = false;
      }
      this.setState({showUserList:showUserList,selectedUser:''},function(){
        this.getUsersAutocompleteList(searchPhrase);
      });
    });
  }

  getUsersAutocompleteList(searchPhrase){
      const self = this;
      const xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          const res = JSON.parse(this.response);
          self.setState({usersList:res,showUserList:true});
        }
      };
      xhttp.open("GET", "https://www.opendesktop.cc/home/searchmember?username="+searchPhrase, true);
      xhttp.send();
  }

  selectUserFromAutocompleteList(user){
    this.setState({selectedUser:user,searchPhrase:user.username,showUserList:false});
  }

  render(){

    let usersAutocompleteList;
    if (this.state.usersList && this.state.showUserList){
      const users = this.state.usersList.map((u,index) => (
        <li onClick={() => this.selectUserFromAutocompleteList(u)} key={index}>
          {u.username}
        </li>
      ));
      usersAutocompleteList = (
        <ul className="autcomplete-list">
          {users}
        </ul>
      );
    }


    let tabContentDisplay;
    if (this.state.currentTab === 'comments'){
      tabContentDisplay = (
        <UserCommentsTab
          user={config.user}
        />
      );
    } else if (this.state.currentTab === 'search'){
      if (this.state.selectedUser){

        tabContentDisplay = (
          <UserSearchTab
            user={this.state.selectedUser}
          />
        );
      } else {
        tabContentDisplay = (
          <p>search user</p>
        );
      }
    }

    return(
      <div id="user-tabs-container">
        <div id="user-tabs-menu">
          <ul>
            <li>
              <a className={this.state.currentTab === "comments" ? "active" : ""}
                onClick={() => this.onTabMenuItemClick('comments')}>
                Comments
              </a>
            </li>
            <li id="search-form-container">
              <a className={this.state.currentTab === "search" ? "active" : ""}
                onClick={() => this.onTabMenuItemClick('search')}>
                <input value={this.state.searchPhrase} type="text" onChange={this.onUserSearchInputChange}/>
              </a>
              {usersAutocompleteList}
            </li>
          </ul>
        </div>
        <div id="user-tabs-content">
          {tabContentDisplay}
        </div>
      </div>
    );
  }
}

class UserCommentsTab extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
      loading:true
    };
    this.getUserOdComments = this.getUserOdComments.bind(this);
    this.getUserForumComments = this.getUserForumComments.bind(this);
  }

  componentDidMount() {
    this.setState({odComments:[],forumComments:[],loading:true},function(){
      this.getUserOdComments();
    });
  }

  getUserOdComments(){
    const user = this.props.user;
    const self = this;
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        const res = JSON.parse(this.response);
        self.setState({odComments:res.commentsOpendeskop,loading:false},function(){
          self.getUserForumComments();
        });
      }
    };
    xhttp.open("GET", "home/memberjson?member_id="+user.member_id, true);
    xhttp.send();
  }

  getUserForumComments(){
    const user = this.props.user;
    const self = this;
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        const res = JSON.parse(this.response);
        self.setState({forumComments:res.user_actions,loading:false});
      }
    };
    xhttp.open("GET", "https://forum.opendesktop.cc/user_actions.json?offset=0&username=" + user.username + "&filter=5", true);
    xhttp.send();
  }

  render(){
    let contentDisplay;
    if (!this.state.loading){
      let odCommentsDisplay, forumCommentsDisplay;
      if (this.state.odComments.length > 0){
        odCommentsDisplay = (
          <UserCommentsTabThreadsContainer
            type={'od'}
            user={this.props.user}
            comments={this.state.odComments}
          />
        );
      }
      if (this.state.forumComments.length > 0){
        forumCommentsDisplay = (
          <UserCommentsTabThreadsContainer
            type={'forum'}
            user={this.props.user}
            comments={this.state.forumComments}
          />
        );
      }

      contentDisplay = (
        <div>
          {odCommentsDisplay}
          {forumCommentsDisplay}
        </div>
      )

    } else {
      contentDisplay = (
        <div>loading</div>
      );
    }

    return(
      <div id="user-comments-tab-container">
        {contentDisplay}
      </div>
    )
  }
}

class UserSearchTab extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
      loading:true
    };
    this.getUserOdComments = this.getUserOdComments.bind(this);
    this.getUserForumComments = this.getUserForumComments.bind(this);
  }

  componentDidMount() {
    this.setState({odComments:[],forumComments:[],loading:true},function(){
      this.getUserOdComments();
    });
  }

  getUserOdComments(){
    const user = this.props.user;
    const self = this;
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        const res = JSON.parse(this.response);
        self.setState({odComments:res.commentsOpendeskop,loading:false},function(){
          self.getUserForumComments();
        });
      } else {
        console.log('what happends here');
        console.log(this);
      }
    };
    xhttp.open("GET", "home/memberjson?member_id="+user.member_id, true);
    xhttp.send();
  }

  getUserForumComments(){
    const user = this.props.user;
    const self = this;
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      console.log('this ');
      if (this.readyState == 4 && this.status == 200) {
        const res = JSON.parse(this.response);
        self.setState({forumComments:res.user_actions,loading:false});
      }
    };
    xhttp.open("GET", "https://forum.opendesktop.cc/user_actions.json?offset=0&username=" + user.username + "&filter=5", true);
    xhttp.send();
  }

  render(){
    let contentDisplay;
    if (!this.state.loading){
      let odCommentsDisplay, forumCommentsDisplay;
      if (this.state.odComments.length > 0){
        odCommentsDisplay = (
          <UserCommentsTabThreadsContainer
            type={'od'}
            user={this.props.user}
            comments={this.state.odComments}
            uType={'search'}
          />
        );
      }
      if (this.state.forumComments.length > 0){
        forumCommentsDisplay = (
          <UserCommentsTabThreadsContainer
            type={'forum'}
            user={this.props.user}
            comments={this.state.forumComments}
            uType={'search'}
          />
        );
      }

      contentDisplay = (
        <div>
          {odCommentsDisplay}
          {forumCommentsDisplay}
        </div>
      )

    } else {
      contentDisplay = (
        <div>loading</div>
      );
    }

    return(
      <div id="user-comments-tab-container">
        {contentDisplay}
      </div>
    )
  }
}

class UserCommentsTabThreadsContainer extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {};
  }

  componentDidMount() {
    let siteInfo;
    if (this.props.type === 'od'){
      siteInfo = {
        address:'openDesktop.org',
        url:'https://www.opendesktop.org'
      }
    } else if (this.props.type === 'forum'){
      siteInfo = {
        address:'forum',
        url:'https://forum.opendesktop.org'
      }
    }

    let threads = [];
    this.props.comments.forEach(function(c,index){
      if (threads.indexOf(c.title) === -1){
        const thread = {
          title:c.title,
          id:c.project_id
        }
        threads.push(thread)
      }
    });

    this.setState({siteInfo:siteInfo,comments:this.props.comments,threads:threads});
  }

  render(){
    const t = this.state.siteInfo;
    const comments = this.state.comments;
    const user = this.props.user;
    let headerDisplay, threadsDisplay, threadCommentsDisplay;
    if (this.state.threads){
      threadsDisplay = this.state.threads.map((tr,index) => (
        <UserCommentsTabThread
          key={index}
          thread={tr}
          comments={comments}
          user={user}
          uType={this.props.uType}
        />
      ));
      headerDisplay = (
        <div className="thread-header">
          <div className="thread-subtitle">
            <p>Discussion on <b><a href={this.state.siteInfo.url}>{this.state.siteInfo.address}</a></b></p>
            <p><span>{this.state.comments.length} comments</span></p>
          </div>
          {threadsDisplay}
        </div>
      );
    }

    return (
      <div className="user-comments-thread-container">
        {headerDisplay}
        <div className="thread-comments">
          {threadCommentsDisplay}
        </div>
      </div>
    )
  }
}

class UserCommentsTabThread extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {};
    this.filterCommentsByThread = this.filterCommentsByThread.bind(this);
  }

  filterCommentsByThread(comment){
    if (comment.title === this.props.thread.title){
      return comment;
    }
  }

  render(){
    let commentsDisplay;
    if (this.props.comments){
      const user = this.props.user;
      commentsDisplay = this.props.comments.filter(this.filterCommentsByThread).map((c,index) => (
        <UserCommentsTabThreadCommentItem
          key={index}
          comment={c}
          user={user}
          uType={this.props.uType}
        />
      ));
    }
    return (
      <div className="user-comments-thread">
        <div className="thread-title">
          <h2><a href={"https://www.opendesktop.cc/p/" + this.props.thread.id}>{this.props.thread.title}</a></h2>
        </div>
        <div className="thread-comments">
          {commentsDisplay}
        </div>
      </div>
    );
  }
}

class UserCommentsTabThreadCommentItem extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {};
  }

  render(){
    const c = this.props.comment;
    const user = this.props.user;
    let repliedUsernameDisplay;
    if (c.p_comment_member_id){
      repliedUsernameDisplay = ( <p className="replied-user"><span className="glyphicon glyphicon-share-alt"></span><a href={"https://forum.opendesktop.cc/u/"+c.p_username+"/messages"}>{c.p_username}</a></p> )
    }

    let userImage = user.avatar;
    if (this.props.uType === 'search'){
      userImage = user.profile_image_url;
    }

    return (
      <div className="comment-item">
        <figure className="comment-item-user-avatar">
          <img className="th-icon" src={userImage}/>
        </figure>
        <div className="comment-item-header">
          <p className="user"><a href={"https://forum.opendesktop.cc/u/"+user.username+"/messages"}>{user.username}</a></p>
          {repliedUsernameDisplay}
          <p className="date-created"><span>{c.comment_created_at}</span></p>
        </div>
        <div className="comment-item-content">
          <div dangerouslySetInnerHTML={{__html:c.comment_text}}></div>
        </div>
      </div>
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

    const self = this;
    setTimeout(function () {
      console.log('time out');
      self.setState({overlayClass:overlayClass});
    }, 200);
  }

  render(){
    return (
      <div ref={node => this.node = node}  id="metaheader-left-mobile" className={this.state.overlayClass}>
        <a className="menu-toggle" id="menu-toggle-item"></a>
        <div id="left-side-overlay">
          <MobileLeftSidePanel
            domains={this.props.domains}
            baseUrl={this.props.baseUrl}
            blogUrl={this.props.blogUrl}
            forumUrl={this.props.forumUrl}
            isAdmin={this.props.isAdmin}
            user={this.props.user}
            baseUrl={this.props.baseUrl}
            gitlabUrl={this.props.gitlabUrl}
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

    let faqLinkItem, apiLinkItem, aboutLinkItem;
    if (config.isExternal === false){
      faqLinkItem = (<li><a className="popuppanel" id="faq" href={"/plings"}>FAQ</a></li>);
      apiLinkItem = (<li><a className="popuppanel" id="api" href={"/partials/ocsapicontent.phtml"}>API</a></li>);
      aboutLinkItem = (<li><a className="popuppanel" id="about" href={"/partials/about.phtml"}>About</a></li>);
    } else {
      faqLinkItem = (<li><a className="popuppanel" target="_blank" id="faq" href={config.baseUrl + "/#faq"}>FAQ</a></li>);
      apiLinkItem = (<li><a className="popuppanel" target="_blank" id="api" href={config.baseUrl + "/#api"}>API</a></li>);
      aboutLinkItem = (<li><a className="popuppanel" target="_blank" id="about" href={config.baseUrl + "/#about"}>About</a></li>);
    }

    return (
      <div id="left-side-panel">
        <div id="panel-header">
          <a href={this.props.baseUrl}>
            <img src={this.props.baseUrl + "/images/system/opendesktop-logo.png"} className="logo"/>
            openDesktop.org
          </a>
        </div>
        <div id="panel-menu">
          <ul>
            {panelMenuGroupsDisplay}
            <li>
              <a className="groupname"><b>Discussion Boards</b></a>
              <ul>
                <li><a href={this.props.forumUrl }>General</a></li>
                <li><a href={this.props.forumUrl + "/c/themes"}>Themes</a></li>
                <li><a href={this.props.forumUrl + "/c/apps"}>Apps</a></li>
                <li><a href={this.props.forumUrl + "/c/coding"}>Coding</a></li>
              </ul>
            </li>
            <DevelopmentDropDownMenu
              user={this.props.user}
              baseUrl={this.props.baseUrl}
              gitlabUrl={this.props.gitlabUrl}
              isAdmin={this.props.isAdmin}
            />
            <li>
              <a className="groupname"><b>More</b></a>
              <ul>
                <li><a href={this.props.baseUrl + "/community"}>Community</a></li>
                <li><a href={this.props.baseUrl + "/support"}>Support</a></li>
                <li><a href={this.props.blogUrl} target="_blank">Blog</a></li>
                {faqLinkItem}
                {apiLinkItem}
                {aboutLinkItem}
              </ul>
            </li>
          </ul>
        </div>
      </div>
    )
  }
}

customElements.define('opendesktop-metaheader', class extends HTMLElement {
  constructor() {
    super();
    this.buildComponent();
  }

  async buildComponent() {

    const stylesheetElement = document.createElement('link');
    stylesheetElement.rel = 'stylesheet';
    stylesheetElement.href = 'https://www.opendesktop.org/theme/react/assets/css/metaheader.css';

    if (location.hostname.endsWith('cc')) {
      stylesheetElement.href = 'https://www.opendesktop.cc/theme/react/assets/css/metaheader.css';
    }
    else if (location.hostname.endsWith('localhost')) {
      stylesheetElement.href = 'https://www.opendesktop.cc/theme/react/assets/css/metaheader.css';
    }else if (location.hostname.endsWith('local')) {
      stylesheetElement.href = '/theme/react/assets/css/metaheader.css';
    }
    else{
       stylesheetElement.href = 'https://www.opendesktop.org/theme/react/assets/css/metaheader.css';
    }
    this.appendChild(stylesheetElement);

    await initConfig(this.getAttribute('config-target'),window.location.href);

    const metaheaderElement = document.createElement('div');
    metaheaderElement.id = 'metaheader';
    ReactDOM.render(React.createElement(MetaHeader, null), metaheaderElement);

    // Component must be capsule within Shadow DOM, and don't hack
    // context/scope of external sites.
    /*
    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(stylesheetElement);
    this.shadowRoot.appendChild(metaheaderElement);
    */

    // However, make this as Light DOM for now, because current
    // implementation is not real component design yet.
    // Need solve event handling, scoped CSS.
    this.appendChild(metaheaderElement);
  }
});