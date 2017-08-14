import React from 'react'
import Link from 'gatsby-link'
import classnames from 'classnames';
import './index.css';

import filesize from 'filesize';
import DropZone from 'react-dropzone';
import readZip, {treeFromFlatPathList} from '../components/parser';
import Tree, {NodeExpander} from '../components/Tree';
import SampleAPK from './sampleAPK.json';
import SampleAPK2 from './sampleAPK2.json';
import AndroidIcon from './android.svgc';


export default class IndexPage extends React.Component {
  state = {
    diffTree: null
  };

  render() {
    if (this.state.diffTree) {
      return this.renderAnalyzer();
    }
    return this.renderPrompt();
  }

  renderAnalyzer() {
    const diffTree = this.state.diffTree;
    const hasRight = !!diffTree.right;
    const fullSizeLeft = diffTree.left.compressedSize;
    const fullSizeRight = hasRight && diffTree.right.compressedSize;

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
          data={this.state.diffTree}
          className={"Analyzer-Tree"}
          expandedIds={this.state.expandedIds}
          header={(props) => {
            if (!hasRight) { return null; }
            return <div className="TreeItem">
              <div style={{flex: 1, textOverflow: 'ellipsis'}}>
              </div>
              <div className="TreeCell">
                Size Left
              </div>
              {hasRight && <div className="TreeCell">
                Size Right
              </div>}
            </div>
          }}
          rowComponent={props => {
            const {left, right} = props.data;
            const percentOfTotalLeft = left && (left.compressedSize / fullSizeLeft * 100);
            const percentOfTotalRight = right && (right.compressedSize / fullSizeRight * 100);
            let diffBytes;
            if (hasRight) {
              diffBytes = (right ? right.compressedSize : 0) - (left ? left.compressedSize : 0);
            }

            let classNames;
            if (!right) {
              classNames = ['removed'];
            } else if (!left) {
              classNames = ['added'];
            }
            if (diffBytes !== 0) {
              classNames = ['changed', diffBytes > 0 ? 'increased' : 'decreased' ]
            } else {
              classNames = ['unchanged']
            }

            return <div
              className={
                classnames(
                  "TreeItem",
                  !props.isLeaf && 'TreeItem--hasChildren',
                  classNames.map(className => `TreeItem--${className}`)
                )
              }
              onClick={() => !props.isLeaf && this.handleRowClick(props.data)}
            >
              <NodeExpander {...props} />

              <div className="TreeCell-Label" style={{flex: 1, textOverflow: 'ellipsis'}}>
                {left ? left.relName : right.relName}
              </div>

              <div className="TreeCell TreeCell-LeftSize">
                {left && left.compressedSize && filesize(left.compressedSize)}
              </div>

              {hasRight && <div className="TreeCell TreeCell-RightSize">
                {right && right.compressedSize && filesize(right.compressedSize)}
                {!right && <span className="TreeCell-Flag">removed</span>}
              </div>}

              {!hasRight &&
                <div className="TreeCell TreeCell-OffTotal" style={{
                  background: `linear-gradient(to left, #f7971e 0%, #ffd200 ${percentOfTotalLeft}%, transparent ${percentOfTotalLeft}%, transparent   100%)`
                }}>
                  {intlFormat.format(percentOfTotalLeft)} %
                </div>
              }

              {hasRight && <div className="TreeCell TreeCell-Diff">
                {diffBytes > 0 ? '+' : ''}{filesize(diffBytes)}
              </div>}
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
        multiple={true}
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
          <p>
            <strong>Note: </strong> No data will be transferred. This
            application is 100% client-side.
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
    this.setState({diffTree: false})
  }

  handlePick = (e) => {
    e.preventDefault();
    this.refs.dropzone.open();
  }

  handleTrySample = (e) => {
    e.preventDefault();
    this.open(SampleAPK, SampleAPK2);
  }

  onDrop = async files => {
    try {
      let leftFile = await readZip(files[0]);
      let rightFile;
      if (files.length > 1) {
        rightFile = await readZip(files[1]);
      }
      this.open(leftFile, rightFile);
    }
    catch (e) {
      console.error(e);
      alert(e);
    }
  }

  open(contentsLeft, contentsRight) {
    let leftTree = treeFromFlatPathList(contentsLeft, 'name', {nameAttribute: 'relName'});
    let rightTree;
    if (contentsRight) {
      rightTree = treeFromFlatPathList(contentsRight, 'name', {nameAttribute: 'relName'});
    }

    const mergedTree = diffTrees(leftTree, rightTree);
    fillTree(mergedTree);
    sortBySize(mergedTree)

    this.setState({diffTree: mergedTree});
  }
}


// Takes two trees, and a key to identify unique entries. Will
// then return a new tree, where every node has the following
// structure:
// {[nameAttribute], [childrenAttribute], leftNode, rightNode}
function diffTrees(leftTree, rightTree, idAttr='name') {

  function handleRecursive(leftNode, rightNode) {
    const newNode = {};
    newNode[idAttr] = leftNode ? leftNode[idAttr] : rightNode[idAttr];
    newNode.left = leftNode;
    newNode.right = rightNode;
    newNode.children = [];

    // Index the right node by id
    const idsInRight = rightNode
      ? rightNode.children.map(child => child[idAttr]) : [];

    // Go through all the children on the left
    const leftChildren = leftNode ? leftNode.children : [];
    for (const leftChild of leftChildren)
    {
      const leftId = leftChild[idAttr];
      if (idsInRight.indexOf(leftId) == -1) {
        newNode.children.push(handleRecursive(leftChild, null));
      }
      else {
        const rightChildIdx = idsInRight.indexOf(leftId);
        const rightChild = rightNode.children[rightChildIdx];
        newNode.children.push(handleRecursive(leftChild, rightChild));
        idsInRight.splice(rightChildIdx, 1, null);
      }
    }

    // Everything remaining in idsInRight is *new* on the right.
    idsInRight.forEach((newIdOnRight, idx) => {
      if (!newIdOnRight) {
        return;
      }
      const rightChild = rightNode.children[idx];
      newNode.children.push(handleRecursive(null, rightChild))
    });

    return newNode;
  }

  return handleRecursive(leftTree, rightTree)
}


// Sort all children by size
function sortBySize(node) {
  node.children.sort((a, b) => {
    const aValue = a.left ? a.left.compressedSize : a.right.compressedSize;
    const bValue = b.left ? b.left.compressedSize : b.right.compressedSize;
    return bValue - aValue;
  })

  for (let child of node.children) {
    sortBySize(child);
  }
}


// Fill in the missing sums
function fillTree(node) {
  // Check if we have to do something at all.
  if (node.left && node.left.compressedSize || node.right && node.right.compressedSize) {
    return node;
  }

  // Sum up the sizes of all children.
  const sumsLeft = {uncompressedSize: 0, compressedSize: 0};
  const sumsRight = {uncompressedSize: 0, compressedSize: 0};
  for (const child of node.children) {
    // Make sure the child is filled itself
    fillTree(child);

    if (child.left) {
      sumsLeft.uncompressedSize += child.left['uncompressedSize'];
      sumsLeft.compressedSize += child.left['compressedSize'];
    }
    if (child.right) {
      sumsRight.uncompressedSize += child.right['uncompressedSize'];
      sumsRight.compressedSize += child.right['compressedSize'];
    }
  }

  if (node.left) {
    Object.assign(node.left, sumsLeft);
  }
  if (node.right) {
    Object.assign(node.right, sumsRight);
  }
}
