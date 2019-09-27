!function(e){var t={};function r(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(n,o,function(t){return e[t]}.bind(null,o));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=4)}([function(e,t,r){"use strict";e.exports=r(1)},function(e,t,r){"use strict";
/** @license React v16.6.1
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var n=r(2),o="function"==typeof Symbol&&Symbol.for,a=o?Symbol.for("react.element"):60103,i=o?Symbol.for("react.portal"):60106,s=o?Symbol.for("react.fragment"):60107,c=o?Symbol.for("react.strict_mode"):60108,l=o?Symbol.for("react.profiler"):60114,u=o?Symbol.for("react.provider"):60109,f=o?Symbol.for("react.context"):60110,p=o?Symbol.for("react.concurrent_mode"):60111,m=o?Symbol.for("react.forward_ref"):60112,h=o?Symbol.for("react.suspense"):60113,d=o?Symbol.for("react.memo"):60115,y=o?Symbol.for("react.lazy"):60116,b="function"==typeof Symbol&&Symbol.iterator;function v(e){for(var t=arguments.length-1,r="https://reactjs.org/docs/error-decoder.html?invariant="+e,n=0;n<t;n++)r+="&args[]="+encodeURIComponent(arguments[n+1]);!function(e,t,r,n,o,a,i,s){if(!e){if(e=void 0,void 0===t)e=Error("Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.");else{var c=[r,n,o,a,i,s],l=0;(e=Error(t.replace(/%s/g,function(){return c[l++]}))).name="Invariant Violation"}throw e.framesToPop=1,e}}(!1,"Minified React error #"+e+"; visit %s for the full message or use the non-minified dev environment for full errors and additional helpful warnings. ",r)}var w={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},g={};function _(e,t,r){this.props=e,this.context=t,this.refs=g,this.updater=r||w}function S(){}function E(e,t,r){this.props=e,this.context=t,this.refs=g,this.updater=r||w}_.prototype.isReactComponent={},_.prototype.setState=function(e,t){"object"!=typeof e&&"function"!=typeof e&&null!=e&&v("85"),this.updater.enqueueSetState(this,e,t,"setState")},_.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")},S.prototype=_.prototype;var j=E.prototype=new S;j.constructor=E,n(j,_.prototype),j.isPureReactComponent=!0;var O={current:null,currentDispatcher:null},k=Object.prototype.hasOwnProperty,C={key:!0,ref:!0,__self:!0,__source:!0};function P(e,t,r){var n=void 0,o={},i=null,s=null;if(null!=t)for(n in void 0!==t.ref&&(s=t.ref),void 0!==t.key&&(i=""+t.key),t)k.call(t,n)&&!C.hasOwnProperty(n)&&(o[n]=t[n]);var c=arguments.length-2;if(1===c)o.children=r;else if(1<c){for(var l=Array(c),u=0;u<c;u++)l[u]=arguments[u+2];o.children=l}if(e&&e.defaultProps)for(n in c=e.defaultProps)void 0===o[n]&&(o[n]=c[n]);return{$$typeof:a,type:e,key:i,ref:s,props:o,_owner:O.current}}function x(e){return"object"==typeof e&&null!==e&&e.$$typeof===a}var N=/\/+/g,U=[];function M(e,t,r,n){if(U.length){var o=U.pop();return o.result=e,o.keyPrefix=t,o.func=r,o.context=n,o.count=0,o}return{result:e,keyPrefix:t,func:r,context:n,count:0}}function T(e){e.result=null,e.keyPrefix=null,e.func=null,e.context=null,e.count=0,10>U.length&&U.push(e)}function $(e,t,r){return null==e?0:function e(t,r,n,o){var s=typeof t;"undefined"!==s&&"boolean"!==s||(t=null);var c=!1;if(null===t)c=!0;else switch(s){case"string":case"number":c=!0;break;case"object":switch(t.$$typeof){case a:case i:c=!0}}if(c)return n(o,t,""===r?"."+R(t,0):r),1;if(c=0,r=""===r?".":r+":",Array.isArray(t))for(var l=0;l<t.length;l++){var u=r+R(s=t[l],l);c+=e(s,u,n,o)}else if(u=null===t||"object"!=typeof t?null:"function"==typeof(u=b&&t[b]||t["@@iterator"])?u:null,"function"==typeof u)for(t=u.call(t),l=0;!(s=t.next()).done;)c+=e(s=s.value,u=r+R(s,l++),n,o);else"object"===s&&v("31","[object Object]"==(n=""+t)?"object with keys {"+Object.keys(t).join(", ")+"}":n,"");return c}(e,"",t,r)}function R(e,t){return"object"==typeof e&&null!==e&&null!=e.key?function(e){var t={"=":"=0",":":"=2"};return"$"+(""+e).replace(/[=:]/g,function(e){return t[e]})}(e.key):t.toString(36)}function A(e,t){e.func.call(e.context,t,e.count++)}function F(e,t,r){var n=e.result,o=e.keyPrefix;e=e.func.call(e.context,t,e.count++),Array.isArray(e)?D(e,n,r,function(e){return e}):null!=e&&(x(e)&&(e=function(e,t){return{$$typeof:a,type:e.type,key:t,ref:e.ref,props:e.props,_owner:e._owner}}(e,o+(!e.key||t&&t.key===e.key?"":(""+e.key).replace(N,"$&/")+"/")+r)),n.push(e))}function D(e,t,r,n,o){var a="";null!=r&&(a=(""+r).replace(N,"$&/")+"/"),$(e,F,t=M(t,a,n,o)),T(t)}var B={Children:{map:function(e,t,r){if(null==e)return e;var n=[];return D(e,n,null,t,r),n},forEach:function(e,t,r){if(null==e)return e;$(e,A,t=M(null,null,t,r)),T(t)},count:function(e){return $(e,function(){return null},null)},toArray:function(e){var t=[];return D(e,t,null,function(e){return e}),t},only:function(e){return x(e)||v("143"),e}},createRef:function(){return{current:null}},Component:_,PureComponent:E,createContext:function(e,t){return void 0===t&&(t=null),(e={$$typeof:f,_calculateChangedBits:t,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null}).Provider={$$typeof:u,_context:e},e.Consumer=e},forwardRef:function(e){return{$$typeof:m,render:e}},lazy:function(e){return{$$typeof:y,_ctor:e,_status:-1,_result:null}},memo:function(e,t){return{$$typeof:d,type:e,compare:void 0===t?null:t}},Fragment:s,StrictMode:c,Suspense:h,createElement:P,cloneElement:function(e,t,r){null==e&&v("267",e);var o=void 0,i=n({},e.props),s=e.key,c=e.ref,l=e._owner;if(null!=t){void 0!==t.ref&&(c=t.ref,l=O.current),void 0!==t.key&&(s=""+t.key);var u=void 0;for(o in e.type&&e.type.defaultProps&&(u=e.type.defaultProps),t)k.call(t,o)&&!C.hasOwnProperty(o)&&(i[o]=void 0===t[o]&&void 0!==u?u[o]:t[o])}if(1===(o=arguments.length-2))i.children=r;else if(1<o){u=Array(o);for(var f=0;f<o;f++)u[f]=arguments[f+2];i.children=u}return{$$typeof:a,type:e.type,key:s,ref:c,props:i,_owner:l}},createFactory:function(e){var t=P.bind(null,e);return t.type=e,t},isValidElement:x,version:"16.6.3",__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED:{ReactCurrentOwner:O,assign:n}};B.unstable_ConcurrentMode=p,B.unstable_Profiler=l;var I={default:B},L=I&&B||I;e.exports=L.default||L},function(e,t,r){"use strict";
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/var n=Object.getOwnPropertySymbols,o=Object.prototype.hasOwnProperty,a=Object.prototype.propertyIsEnumerable;e.exports=function(){try{if(!Object.assign)return!1;var e=new String("abc");if(e[5]="de","5"===Object.getOwnPropertyNames(e)[0])return!1;for(var t={},r=0;r<10;r++)t["_"+String.fromCharCode(r)]=r;if("0123456789"!==Object.getOwnPropertyNames(t).map(function(e){return t[e]}).join(""))return!1;var n={};return"abcdefghijklmnopqrst".split("").forEach(function(e){n[e]=e}),"abcdefghijklmnopqrst"===Object.keys(Object.assign({},n)).join("")}catch(e){return!1}}()?Object.assign:function(e,t){for(var r,i,s=function(e){if(null==e)throw new TypeError("Object.assign cannot be called with null or undefined");return Object(e)}(e),c=1;c<arguments.length;c++){for(var l in r=Object(arguments[c]))o.call(r,l)&&(s[l]=r[l]);if(n){i=n(r);for(var u=0;u<i.length;u++)a.call(r,i[u])&&(s[i[u]]=r[i[u]])}}return s}},,function(e,t,r){"use strict";r.r(t);var n=r(0),o=r.n(n);function a(e){return(a="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function i(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function s(e){return(s=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function c(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function l(e,t){return(l=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var u=function(e){function t(e){var r,n,o;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),n=this,(r=!(o=s(t).call(this,e))||"object"!==a(o)&&"function"!=typeof o?c(n):o).state={searchText:""},r.onSearchTextChange=r.onSearchTextChange.bind(c(r)),r.onSearchFormSubmit=r.onSearchFormSubmit.bind(c(r)),r}var r,n,u;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&l(e,t)}(t,o.a.Component),r=t,(n=[{key:"onSearchTextChange",value:function(e){this.setState({searchText:e.target.value})}},{key:"onSearchFormSubmit",value:function(e){e.preventDefault(),window.location.href=this.props.searchBaseUrl+this.state.searchText}},{key:"render",value:function(){var e;this.props.store.name.toLowerCase().indexOf("appimagehub")>-1&&(e={marginTop:parseInt(this.props.height.split("px")[0])/2-19+"px"});return o.a.createElement("div",{id:"site-header-search-form",style:e},o.a.createElement("form",{id:"search-form",onSubmit:this.onSearchFormSubmit},o.a.createElement("input",{onChange:this.onSearchTextChange,value:this.state.searchText,type:"text",name:"projectSearchText"}),o.a.createElement("a",{onClick:this.onSearchFormSubmit})))}}])&&i(r.prototype,n),u&&i(r,u),t}();function f(e){return(f="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function p(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function m(e){return(m=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function h(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function d(e,t){return(d=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var y=function(e){function t(e){var r,n,o;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),n=this,(r=!(o=m(t).call(this,e))||"object"!==f(o)&&"function"!=typeof o?h(n):o).state={selected:"month"},r.handleClick=r.handleClick.bind(h(r)),r.tabSwitch=r.tabSwitch.bind(h(r)),r}var r,a,i;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&d(e,t)}(t,n["Component"]),r=t,(a=[{key:"componentWillMount",value:function(){document.addEventListener("click",this.handleClick,!1)}},{key:"componentWillUnmount",value:function(){document.removeEventListener("click",this.handleClick,!1)}},{key:"handleClick",value:function(e){var t="";this.node.contains(e.target)&&(t="header-supporters"===e.target.className&&"open"===this.state.dropdownClass?"":"open"),this.setState({dropdownClass:t})}},{key:"tabSwitch",value:function(e){this.setState({selected:e})}},{key:"render",value:function(){var e,t=this;if(this.props.section.supporters){var r,n=o.a.createElement("div",{className:"pling-nav-tabs"},o.a.createElement("ul",{className:"nav nav-tabs pling-section-tabs"},o.a.createElement("li",{key:"month",className:"month"==this.state.selected?"active":"",onClick:function(){return t.tabSwitch("month")}},o.a.createElement("a",{className:"cls-tab-month"},"Months")),o.a.createElement("li",{key:"amount",className:"amount"==this.state.selected?"active":"",onClick:function(){return t.tabSwitch("amount")}},o.a.createElement("a",{className:"cls-tab-amount"},"Amount"))));r="amount"==this.state.selected?this.props.section.supporters.sort(function(e,t){return Number(e.sum_support)<Number(t.sum_support)}).map(function(e,t){return o.a.createElement("div",{className:"section"},o.a.createElement("div",{className:"section-name"},o.a.createElement("a",{href:"/u/"+e.username},o.a.createElement("img",{src:e.profile_image_url})),o.a.createElement("span",null,o.a.createElement("a",{href:"/u/"+e.username},e.username))),o.a.createElement("div",{className:"section-value"}," $",e.sum_support))}):this.props.section.supporters.sort(function(e,t){return Number(e.active_months)<Number(t.active_months)}).map(function(e,t){return o.a.createElement("div",{className:"section"},o.a.createElement("div",{className:"section-name"},o.a.createElement("a",{href:"/u/"+e.username},o.a.createElement("img",{src:e.profile_image_url})),o.a.createElement("span",null,o.a.createElement("a",{href:"/u/"+e.username},e.username))),o.a.createElement("div",{className:"section-value"}," ",e.active_months+" months"))});var a=o.a.createElement("div",{className:"user-pling-section-container"},n,r);e=o.a.createElement("ul",{className:"dropdown-menu dropdown-menu-right"},a)}var i=this.props.section.supporters.length,s=50*Math.ceil(i/50);0==s&&(s=50);var c,l=" Goal: "+i+" / "+s;return c={width:i/s*100+"%"},o.a.createElement("div",{className:"pling-section-header "},o.a.createElement("div",{className:"header-body"},o.a.createElement("div",{className:"score-container"},o.a.createElement("span",null,o.a.createElement("a",{href:"/section?id="+this.props.section.section_id},this.props.section?this.props.section.name:"")),o.a.createElement("div",{className:"score-bar-container"},o.a.createElement("div",{className:"score-bar",style:c},l))),o.a.createElement("div",{ref:function(e){return t.node=e},className:"supporter-container "+this.state.dropdownClass},o.a.createElement("a",{className:"header-supporters"}," Supporters ⌄ "),e)))}}])&&p(r.prototype,a),i&&p(r,i),t}();function b(e){return(b="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function v(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function w(e){return(w=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function g(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function _(e,t){return(_=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var S=function(e){function t(e){var r,n,o;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),n=this,(r=!(o=w(t).call(this,e))||"object"!==b(o)&&"function"!=typeof o?g(n):o).state={status:"switch"},r.showMobileUserMenu=r.showMobileUserMenu.bind(g(r)),r.showMobileSearchForm=r.showMobileSearchForm.bind(g(r)),r.showMobileSwitchMenu=r.showMobileSwitchMenu.bind(g(r)),r}var r,n,a;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&_(e,t)}(t,o.a.Component),r=t,(n=[{key:"showMobileUserMenu",value:function(){this.setState({status:"user"})}},{key:"showMobileSearchForm",value:function(){this.setState({status:"search"})}},{key:"showMobileSwitchMenu",value:function(){this.setState({status:"switch"})}},{key:"render",value:function(){this.props.template["header-nav-tabs"]["border-color"],this.props.template["header-nav-tabs"]["background-color"];var e,t,r=o.a.createElement("a",{className:"menu-item",onClick:this.showMobileSwitchMenu},o.a.createElement("span",{className:"glyphicon glyphicon-remove"}));this.props.section&&this.props.user&&this.props.user.isAdmin&&(e=o.a.createElement("div",{id:"siter-header-pling"},o.a.createElement(y,{section:this.props.section,amount:this.props.section.amount,goal:this.props.section.goal,amount_factor:this.props.section.amount_factor,isAdmin:this.props.user.isAdmin}))),"switch"===this.state.status?t=o.a.createElement("div",{id:"switch-menu"},o.a.createElement("a",{className:"menu-item",onClick:this.showMobileSearchForm,id:"user-menu-switch"},o.a.createElement("span",{className:"glyphicon glyphicon-search"})),e):"user"===this.state.status?t=o.a.createElement("div",{id:"mobile-user-menu"},o.a.createElement("div",{className:"menu-content-wrapper"},o.a.createElement(MobileUserContainer,{user:this.props.user,baseUrl:this.props.baseUrl,serverUrl:this.state.serverUrl,template:this.props.template,redirectString:this.props.redirectString})),r):"search"===this.state.status&&(t=o.a.createElement("div",{id:"mobile-search-menu"},o.a.createElement("div",{className:"menu-content-wrapper"},o.a.createElement(u,{baseUrl:this.props.baseUrl,searchBaseUrl:this.props.searchBaseUrl,store:this.props.store})),r));var n=this.props.store.name;return"switch"!==this.state.status&&(n+=" mini-version"),o.a.createElement("section",{id:"mobile-site-header"},o.a.createElement("div",{id:"mobile-site-header-logo",className:n},o.a.createElement("a",{href:this.props.logoLink},o.a.createElement("img",{src:this.props.template["header-logo"]["image-src"]}))),o.a.createElement("div",{id:"mobile-site-header-menus-container"},t))}}])&&v(r.prototype,n),a&&v(r,a),t}();function E(e){return(E="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function j(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function O(e){return(O=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function k(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function C(e,t){return(C=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var P=function(e){function t(e){var r,n,o;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),n=this,(r=!(o=O(t).call(this,e))||"object"!==E(o)&&"function"!=typeof o?k(n):o).state={baseUrl:window.json_baseurl,searchBaseUrl:window.json_searchbaseurl,cat_title:window.json_cat_title,hasIdentity:window.json_hasIdentity,is_show_title:window.json_is_show_title,redirectString:window.json_redirectString,serverUrl:window.json_serverUrl,serverUri:window.json_serverUri,store:{sName:window.json_sname,name:window.json_store_name,order:window.json_store_order,last_char_store_order:window.json_last_char_store_order},user:window.json_member,logo:window.json_logoWidth,cat_title_left:window.json_cat_title_left,tabs_left:window.tabs_left,template:window.json_template,status:"",section:window.json_section,url_logout:window.json_logouturl},r.updateDimensions=r.updateDimensions.bind(k(r)),r}var r,a,i;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&C(e,t)}(t,n["Component"]),r=t,(a=[{key:"componentWillMount",value:function(){this.updateDimensions()}},{key:"componentDidMount",value:function(){window.addEventListener("resize",this.updateDimensions),window.addEventListener("orientationchange",this.updateDimensions)}},{key:"updateDimensions",value:function(){var e,t=window.innerWidth;t>=910?e="large":t<910&&t>=610?e="mid":t<610&&(e="tablet"),this.setState({device:e})}},{key:"render",value:function(){var e,t,r,n,a=this.state.serverUrl;this.state.serverUri.indexOf("/s/")>-1&&(a+="/s/"+this.state.store.name),"1"===this.state.is_show_title&&(e=o.a.createElement("div",{id:"site-header-store-name-container"},o.a.createElement("a",{href:a},this.state.store.name))),this.state.section&&this.state.user&&this.state.user.isAdmin&&(t=o.a.createElement("div",{id:"siter-header-pling"},o.a.createElement(y,{section:this.state.section,amount:this.state.section.amount,goal:this.state.section.goal,amount_factor:this.state.section.amount_factor,isAdmin:this.state.user.isAdmin,headerStyle:this.state.template["header-supporter-style"]}))),r="tablet"!==this.state.device?o.a.createElement("section",{id:"site-header-wrapper"},o.a.createElement("div",{id:"siter-header-left"},o.a.createElement("div",{id:"site-header-logo-container",style:this.state.template["header-logo"]},o.a.createElement("a",{href:a},o.a.createElement("img",{src:this.state.template["header-logo"]["image-src"]}))),e),o.a.createElement("div",{id:"site-header-right"},o.a.createElement("div",{id:"site-header-right-top",className:void 0},o.a.createElement(u,{baseUrl:this.state.baseUrl,searchBaseUrl:this.state.searchBaseUrl,store:this.state.store,height:this.state.template.header.height}),t))):o.a.createElement(S,{logoLink:a,template:this.state.template,user:this.state.user,baseUrl:this.state.baseUrl,searchBaseUrl:this.state.searchBaseUrl,serverUrl:this.state.serverUrl,store:this.state.store,redirectString:this.state.redirectString,section:this.state.section}),this.state.template&&(n={backgroundImage:this.state.template.header["background-image"],backgroundColor:this.state.template.header["background-color"],height:this.state.template.header.height});var i=this.state.store.name.toLowerCase();return i.indexOf(".")>-1&&(i=i.split(".")[0]),o.a.createElement("section",{id:"site-header",style:n,className:i},r)}}])&&j(r.prototype,a),i&&j(r,i),t}();ReactDOM.render(o.a.createElement(P,null),document.getElementById("site-header-container"))}]);