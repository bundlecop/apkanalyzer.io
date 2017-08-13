import React from 'react'
import Link from 'gatsby-link'
import './index.css';

import filesize from 'filesize';
import DropZone from 'react-dropzone';
import readZip, {treeFromFlatPathList} from '../components/parser';
import Tree from '../components/Tree';


export default class IndexPage extends React.Component {
  state = {
    openZip: null,
    dopenZip: {
      name: '',
      children: [
        {name: 'test', children: [
          {name: 'test', children: [
            {name: 'test', children: [
              {name: 'test', children: [
                {name: 'test', children: [
                ]}
              ]}
            ]}
          ]},
          {name: 'test', children: [
            {name: 'test', children: [
              {name: 'test', children: [
                {name: 'test', children: [
                ]}
              ]},
              {name: 'test', children: [
                {name: 'test', children: [
                ]}
              ]},
              {name: 'test', children: [
                {name: 'test', children: [
                ]},
                {name: 'test', children: [
                ]},
                {name: 'test', children: [
                ]}
              ]},
              {name: 'test', children: [
                {name: 'test', children: [
                ]},
                {name: 'test', children: [
                ]},
                {name: 'test', children: [
                ]}
              ]}
            ]}
          ]},
          {name: 'test', children: [
            {name: 'test', children: [
              {name: 'test', children: [
                {name: 'test', children: [
                ]}
              ]}
            ]}
          ]}
        ]}
      ]
    }
  };

  render() {
    if (this.state.openZip) {
      return this.renderAnalyzer();
    }
    return this.renderPrompt();
  }

  renderAnalyzer() {
    return <div>
      <Tree
        data={this.state.openZip}
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
    >
    </DropZone>
  }

  onDrop = async files => {
    let zipContents = treeFromFlatPathList(await readZip(files[0]), 'name', {nameAttribute: 'relName'});
    console.log(zipContents)

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

    fillNode(zipContents);

    this.setState({openZip: zipContents});
  }
}

