import React from 'react'
import Link from 'gatsby-link'
import classnames from 'classnames';
import './index.css';

import filesize from 'filesize';
import DropZone from 'react-dropzone';
import readZip, {treeFromFlatPathList} from '../components/parser';
import Tree, {NodeExpander} from '../components/Tree';
import SampleAPK from './sampleAPK.json';
import AndroidIcon from './android.svgc';


export default class IndexPage extends React.Component {
  state = {
    openZip: null
  };

  render() {
    if (this.state.openZip) {
      return this.renderAnalyzer();
    }
    return this.renderPrompt();
  }

  renderAnalyzer() {
    const fullSize = this.state.openZip.compressedSize;
    const intlFormat = new Intl.NumberFormat({ style: 'percent' });

    return <div className="AnalyzerScreen">
      <div className="Header">
        <h1 style={{flex: 1}}>
          <AndroidIcon /> APK Analyzer
        </h1>
        <button onClick={this.handleStartOver}>
          Start over
        </button>

        <button>
          Compare with another APK
        </button>
      </div>
      <div className="Analyzer">
        <Tree
          data={this.state.openZip}
          className={"Analyzer-Tree"}
          expandedIds={this.state.expandedIds}
          rowComponent={props => {
            const percentOfTotal = props.data.compressedSize / fullSize * 100;
            return <div
              className={classnames("TreeItem", !props.isLeaf && 'TreeItem--hasChildren')}
              onClick={() => !props.isLeaf && this.handleRowClick(props.data)}
            >
              <NodeExpander {...props} />
              <div style={{flex: 1, textOverflow: 'ellipsis'}}>
                {props.data.relName}
              </div>
              <div className="TreeCell">
                {filesize(props.data.compressedSize)}
              </div>
              <div className="TreeCell" style={{
                background: `linear-gradient(to left, #f7971e 0%, #ffd200 ${percentOfTotal}%, transparent ${percentOfTotal}%, transparent   100%)`
              }}>
                {intlFormat.format(percentOfTotal)} %
              </div>
            </div>
          }}
          getChildren={node => node.children}
          getId={node => node.name}
        />
      </div>
      <div className="Footer">
        Brought to you by <a href="https://bundlecop.com">BundleCop</a>.
        You can find the source code of this tool <a href="https://github.com/bundlecop/apkanalyzer.io">on Github</a>.
      </div>
    </div>
  }

  renderPrompt() {
    return <div className="PromptScreen">
      <DropZone
        onDrop={this.onDrop}
        multiple={false}
        disableClick={true}
        ref="dropzone"
        acceptClassName="IndexPage-DropZone--accepting"
        className="IndexPage-DropZone"
      >
        <h1 style={{fontSize: '3em'}}>
          <AndroidIcon /> APK Analyzer
        </h1>
        <h4>
          brought to you by <a href="https://bundlecop.com">BundleCop</a>
        </h4>
        <div style={{maxWidth: '700px'}}>
          <p style={{marginTop: '40px'}}>
            You may have seen it as part of Android Studio, and now
            it's right here, in your browser.
          </p>
          <p>
            Just drop an APK file
            here, and you'll see what's inside, and which files take
            up most of the space. Drop <strong>two APK files</strong>, and we'll compare
            the two.
          </p>
        </div>
        <div style={{marginTop: '20px'}}>
          <button onClick={this.handleTrySample}>
            Try a sample
          </button>
          &nbsp;&nbsp;&nbsp;
          <button onClick={this.handlePick}>
            Pick a file
          </button>
        </div>
      </DropZone>
    </div>
  }

  handleRowClick = (data) => {
    const newIds = this.state.expandedIds ? [...this.state.expandedIds] : [];
    const idx = newIds.indexOf(data.name);
    if (idx > -1) {
      newIds.splice(idx, 1)
    } else {
      newIds.push(data.name);
    }
    this.setState({expandedIds: newIds})
  }

  handleStartOver = () => {
    this.setState({openZip: false})
  }

  handlePick = (e) => {
    e.preventDefault();
    this.refs.dropzone.open();
  }

  handleTrySample = (e) => {
    e.preventDefault();
    this.open(SampleAPK);
  }

  onDrop = async files => {
    this.open(await readZip(files[0]));
  }

  open(contents) {
    let asTree = treeFromFlatPathList(contents, 'name', {nameAttribute: 'relName'});
    fillNode(asTree);
    sortBySize(asTree)
    this.setState({openZip: asTree});
  }
}


// Sort all children by size
function sortBySize(node) {
  node.children.sort((a, b) => {
    return b.compressedSize - a.compressedSize
  })

  for (let child of node.children) {
    sortBySize(child);
  }
}


// Fill in the missing sums
function fillNode(node) {
  const sums = {uncompressedSize: 0, compressedSize: 0};

  for (let child of node.children) {
    if (!child['uncompressedSize']) {
      fillNode(child);
    }
    sums.uncompressedSize += child['uncompressedSize'];
    sums.compressedSize += child['compressedSize'];
  }

  Object.assign(node, sums);
}
