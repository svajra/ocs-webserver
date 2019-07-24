import React from 'react';
import UserLoginMenuContainer from './UserLoginMenuContainer';
// import UserLoginMenuContainerVersionTwo from './UserLoginMenuContainerVersionTwo';
import UserContextMenuContainer from './UserContextMenuContainer';
import DevelopmentAppMenu from './DevelopmentAppMenu';
import SearchMenuContainer from './SearchMenuContainer';
//import SwitchItem from './SwitchItem';
import AboutMenu from './AboutMenu';
import AnonymousMenu from './AnonymousMenu';

class UserMenu extends React.Component {
  constructor(props){
    super(props);
    this.state = {};
  }

  render(){
    let searchMenuDisplay;
    if (this.props.user && this.props.isAdmin ){
      searchMenuDisplay = <SearchMenuContainer baseUrl={this.props.baseUrl}/>
    }

    let userDropdownDisplay, developmentAppMenuDisplay;
    if (this.props.user && this.props.user.member_id){
      userDropdownDisplay = (
        <UserLoginMenuContainer
          user={this.props.user}
          forumUrl={this.props.forumUrl}
          gitlabUrl={this.props.gitlabUrl}
          isAdmin={this.props.isAdmin}
          logoutUrl={this.props.logoutUrl}
          baseUrl={this.props.baseUrl}
          baseUrlStore={this.props.baseUrlStore}
          myopendesktopUrl={this.props.myopendesktopUrl}
          cloudopendesktopUrl={this.props.cloudopendesktopUrl}
          musicopendesktopUrl={this.props.musicopendesktopUrl}
          docsopendesktopUrl={this.props.docsopendesktopUrl}
          onSwitchStyle={this.props.onSwitchStyle}
          onSwitchStyleChecked={this.props.onSwitchStyleChecked}
        />
      );


      developmentAppMenuDisplay = (
        <DevelopmentAppMenu
          user={this.props.user}
          forumUrl={this.props.forumUrl}
          gitlabUrl={this.props.gitlabUrl}
          isAdmin={this.props.isAdmin}
          baseUrl={this.props.baseUrl}
          baseUrlStore={this.props.baseUrlStore}
          myopendesktopUrl={this.props.myopendesktopUrl}
          cloudopendesktopUrl={this.props.cloudopendesktopUrl}
          musicopendesktopUrl={this.props.musicopendesktopUrl}
          docsopendesktopUrl={this.props.docsopendesktopUrl}
        />
      );
    } else {
      userDropdownDisplay = (
        <React.Fragment>
        <li id="user-register-container"><a href={this.props.baseUrl + "/register"}>Register</a> or</li>
        <li id="user-login-container"><a href={this.props.loginUrl} className="btn btn-metaheader">Login</a></li>
        </React.Fragment>
    )
    }

    let  anonymousMenu;
    if(!this.props.user)
    {
        anonymousMenu= <AnonymousMenu baseUrlStore={this.props.baseUrlStore} user={this.props.user}/>
    }


    let  chatItem=(<li id="chat-link-item"><a href={this.props.riotUrl}>
        <img src={this.props.baseUrl+"/theme/react/assets/img/logo-riot.svg"} className="riotIcon"></img>Chat
      </a></li>);



    let userMenuContainerDisplay;
    if (this.props.device === "large"){


      const aboutMenu = <AboutMenu blogUrl={this.props.blogUrl}
                                  isExternal={this.props.isExternal}
                                  baseUrl={this.props.baseUrl}
                                  isAdmin={this.props.isAdmin}
                                  />



      userMenuContainerDisplay = (
        <ul className="metaheader-menu" id="user-menu">
          <li><a href={this.props.baseUrl + "/support"}>Supporter</a></li>
          {aboutMenu}
          {searchMenuDisplay}
          {chatItem}

          {developmentAppMenuDisplay}
          {userDropdownDisplay}
          {anonymousMenu}
        </ul>
      );
    } else {
      userMenuContainerDisplay = (
        <ul className="metaheader-menu" id="user-menu">
          {chatItem}
          {developmentAppMenuDisplay}
          {userDropdownDisplay}
          {anonymousMenu}
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

export default UserMenu;
