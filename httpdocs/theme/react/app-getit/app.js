class GetIt extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {};
    this.onGetItButtonClick = this.onGetItButtonClick.bind(this);
  }

  componentDidMount() {
    console.log('bla bla');
  }

  onGetItButtonClick(){
    console.log('on get it button click');
  }


  render(){
    return (
      <div id="get-it">
        <button
          data-toggle="modal"
          data-target="#myModal"
          style={{"width":"100%"}}
          id="project_btn_getit" className="btn dropdown-toggle active btn-primary  "
          type="button">Get it</button>
          <div className="modal fade" id="myModal" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                  <h4 className="modal-title" id="myModalLabel">Modal title</h4>
                </div>
                <div className="modal-body">
                  ...
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                  <button type="button" className="btn btn-primary">Save changes</button>
                </div>
              </div>
            </div>
          </div>
      </div>
    )
  }
}

class GetItFilesList extends React.Component {
  render(){
    let filesDisplay;
    const files = this.props.files.map((f,index) => (
      <GetItFilesListItem
        product={this.props.product}
        key={index}
        file={f}
      />
    ));
    const summeryRow = productHelpers.getFilesSummary(this.props.files);
    filesDisplay = (
      <tbody>
        {files}
        <tr>
          <td>{summeryRow.total} files (0 archived)</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td>{summeryRow.downloads}</td>
          <td></td>
          <td>{appHelpers.getFileSize(summeryRow.fileSize)}</td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    );
    return (
      <div id="files-tab" className="product-tab">
        <table className="mdl-data-table mdl-js-data-table mdl-shadow--2dp">
          <thead>
            <tr>
              <th className="mdl-data-table__cell--non-numericm">File</th>
              <th className="mdl-data-table__cell--non-numericm">Version</th>
              <th className="mdl-data-table__cell--non-numericm">Description</th>
              <th className="mdl-data-table__cell--non-numericm">Packagetype</th>
              <th className="mdl-data-table__cell--non-numericm">Architecture</th>
              <th className="mdl-data-table__cell--non-numericm">Downloads</th>
              <th className="mdl-data-table__cell--non-numericm">Date</th>
              <th className="mdl-data-table__cell--non-numericm">Filesize</th>
              <th className="mdl-data-table__cell--non-numericm">DL</th>
              <th className="mdl-data-table__cell--non-numericm">OCS-Install</th>
            </tr>
          </thead>
          {filesDisplay}
        </table>
      </div>
    );
  }
}

class GetItFilesListItem extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {downloadLink:""};
  }

  componentDidMount() {
    let baseUrl, downloadLinkUrlAttr;
    if (store.getState().env === 'live') {
      baseUrl = 'opendesktop.org';
      downloadLinkUrlAttr = "https%3A%2F%dl.opendesktop.org%2Fapi%2F";
    } else {
      baseUrl = 'pling.cc';
      downloadLinkUrlAttr = "https%3A%2F%2Fcc.ppload.com%2Fapi%2F";
    }

    const f = this.props.file;
    const timestamp =  Math.floor((new Date().getTime() / 1000)+3600)
    const fileDownloadHash = appHelpers.generateFileDownloadHash(f,store.getState().env);
    let downloadLink = "https://"+baseUrl+
                       "/p/"+this.props.product.project_id+
                       "/startdownload?file_id="+f.id+
                       "&file_name="+f.title+
                       "&file_type="+f.type+
                       "&file_size="+f.size+
                       "&url="+downloadLinkUrlAttr+
                       "files%2Fdownloadfile%2Fid%2F"+f.id+
                       "%2Fs%2F"+fileDownloadHash+
                       "%2Ft%2F"+timestamp+
                       "%2Fu%2F"+this.props.product.member_id+
                       "%2F"+f.title;
    this.setState({downloadLink:downloadLink});
  }

  render(){
    const f = this.props.file;
    return (
      <tr>
        <td className="mdl-data-table__cell--non-numericm">
          <a href={this.state.downloadLink}>{f.title}</a>
        </td>
        <td>{f.version}</td>
        <td className="mdl-data-table__cell--non-numericm">{f.description}</td>
        <td className="mdl-data-table__cell--non-numericm">{f.packagename}</td>
        <td  className="mdl-data-table__cell--non-numericm">{f.archname}</td>
        <td>{f.downloaded_count}</td>
        <td className="mdl-data-table__cell--non-numericm">{appHelpers.getTimeAgo(f.created_timestamp)}</td>
        <td className="mdl-data-table__cell--non-numericm">{appHelpers.getFileSize(f.size)}</td>
        <td><a href={this.state.downloadLink}><i className="material-icons">cloud_download</i></a></td>
        <td>{f.ocs_compatible}</td>
      </tr>
    )
  }
}

ReactDOM.render(
    <GetIt />,
    document.getElementById('get-it-container')
);
