import React from 'react'
import Link from 'gatsby-link'
import './index.css';

import filesize from 'filesize';
import DropZone from 'react-dropzone';
import readZip, {treeFromFlatPathList} from '../components/parser';
import Tree from '../components/Tree';
import SampleAPK from './sampleAPK.json';


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
    return <div className="Analyzer">
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
  }

  renderPrompt() {
    return <DropZone
      onDrop={this.onDrop}
      multiple={false}
      className="IndexPage-DropZone"
    >
      <h1>Android APK Analyzer</h1>
      <h4>brought to you by BundleCop</h4>
      <p>
        You may have seen it as part of Android Studio, and now
        it's right here, in your browser.
      </p>
      <p>
        Just drop an APK file
        here, and you'll see what's inside, and which files take
        up most of the space. Try drop APK files, and we'll compare
        the two.
      </p>
      <button onClick={this.handleTrySample}>
        Try a sample
      </button>
    </DropZone>
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
