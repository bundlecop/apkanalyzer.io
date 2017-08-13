import React from 'react'
import Link from 'gatsby-link'
import './index.css';

import filesize from 'filesize';
import DropZone from 'react-dropzone';
import readZip, {treeFromFlatPathList} from '../components/parser';
import Tree from '../components/Tree';
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
          rowComponent={props => {
            return <div className="TreeItem">
              <div className="TreeCell" style={{flex: 1}}>
                {props.data.relName}
              </div>
              <div className="TreeCell">
                {filesize(props.data.uncompressedSize)}
              </div>
            </div>
          }}
          getChildren={node => node.children}
        />
      </div>
      <div className="Footer">
        Brought to you by <a href="https://bundlecop.com">BundleCop</a>.
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

  handleStartOver = () => {
    this.setState({openZip: false})
  }

  handlePick = (e) => {
    e.preventDefault();
    this.refs.dropzone.open();
  }

  handleTrySample = (e) => {
    e.preventDefault();
    fillNode(SampleAPK);
    this.setState({openZip: SampleAPK});
  }

  onDrop = async files => {
    let zipContents = treeFromFlatPathList(await readZip(files[0]), 'name', {nameAttribute: 'relName'});

    fillNode(zipContents);

    this.setState({openZip: zipContents});
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
