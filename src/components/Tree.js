import React, {PropTypes as T} from  'react';
import './Tree.css';


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
    const {getChildren, getId, expandedIds, rowComponent: RowComponent, data} = this.props;

    const elems = [];
    function build(children, level, parentIdx) {
      children.forEach((child, idx) => {
        elems.push(<Item
          key={`${parentIdx}-${idx}`}
          level={level}
        >
          <RowComponent data={child} />
        </Item>);

        if (expandedIds && expandedIds.indexOf(getId(child)) > -1) {
          build(getChildren(child), level+1, `${parentIdx}-${idx}`)
        }
      });
    }
    build(getChildren(data), 0, "r")

    return <div className="Tree">
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