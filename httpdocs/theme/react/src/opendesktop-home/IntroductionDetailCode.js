import React from 'react';
function IntroductionDetailCode(props){
  return(
    <div className="detail-code detail">
      <div className="icon-container">
        <a href="https://www.opencode.net/dashboard/projects">
          <div className="icon"></div>
        </a>
      </div>
      <div className="description">
            <h2>
            openCode.net
            </h2>
            <div>
            Version control system. Opencode is open source software to
            collaborate on code.
            <p>Powered by Gitlab.</p>
            <a href="www.opencode.net"> www.opencode.net </a>
            </div>
      </div>
    </div>
  )
}

export default IntroductionDetailCode;