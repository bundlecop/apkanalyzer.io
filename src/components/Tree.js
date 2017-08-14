import React, {PropTypes as T} from  'react';
import './Tree.css';
import TreeExpandIcon from './tree-expand.svgc';


export default class Tree extends React.Component {
  static propTypes = {
    data: T.any.isRequired,
    getId: T.func.isRequired,
    getChildren: T.func.isRequired,
    rowComponent: T.any.isRequired,
    expandedIds: T.arrayOf(T.any)
  };

  defaultProps = {
    expandedIds: null
  }

  render() {
    const {getChildren, headerComponent: HeaderComponent, getId, expandedIds, rowComponent: RowComponent, data} = this.props;

    const elems = [];
    function build(children, level, parentIdx) {
      children.forEach((child, idx) => {
        const childrenOfChild = getChildren(child);
        const isLeaf = !childrenOfChild || !childrenOfChild.length;
        const isExpanded = !isLeaf && expandedIds && expandedIds.indexOf(getId(child)) > -1;

        elems.push(<Item
          key={`${parentIdx}-${idx}`}
          level={level}
        >
          <RowComponent
            data={child}
            isLeaf={isLeaf}
            isExpanded={isExpanded}
          />
        </Item>);

        if (isExpanded) {
          build(childrenOfChild, level+1, `${parentIdx}-${idx}`)
        }
      });
    }
    build(getChildren(data), 0, "r")

    return <div className="Tree">
      {HeaderComponent && <HeaderComponent />}
      {elems}
    </div>
  }
}


function Item({level, children}) {
  return  <div style={{
    paddingLeft: `${level * '20'}px`
  }}>
    {children}
  </div>
}


export function NodeExpander(props) {
  return <TreeExpandIcon
    style={{
      visibility: props.isLeaf ? 'hidden' : null,
      fill: 'white',
      height: '10px',
      transform: props.isExpanded ? null : 'rotate(-90deg)'
    }}
  />
  return <span>{props.isLeaf ? '' : props.isExpanded ? '-' : '+'}</span>;
}