import {digg, digs} from "diggerize"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import {memo} from "react"
import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component"

export default memo(shapeComponent(class ApiMakerTableFilter extends ShapeComponent {
  static propTypes = PropTypesExact({
    a: PropTypes.string,
    filterIndex: PropTypes.number.isRequired,
    onClick: PropTypes.func.isRequired,
    onRemoveClicked: PropTypes.func.isRequired,
    p: PropTypes.array.isRequired,
    pre: PropTypes.string,
    sc: PropTypes.string,
    v: PropTypes.string.isRequired
  })

  render() {
    const {p, v} = digs(this.props, "p", "v")
    const {a, pre, sc} = this.props

    return (
      <div style={{display: "inline-block", backgroundColor: "grey", padding: "10px 6px"}}>
        <span className="filter-label" onClick={digg(this, "onFilterClicked")} style={{cursor: "pointer"}}>
          {p.length > 0 &&
            `${p.join(".")}.`
          }
          {a} {sc} {pre} {v}
        </span>
        <span>
          <a className="remove-filter-button" href="#" onClick={digg(this, "onRemoveFilterClicked")}>
            <i className="fa fa-remove la la-remove" />
          </a>
        </span>
      </div>
    )
  }

  onFilterClicked = (e) => {
    e.preventDefault()

    const {a, filterIndex, p, pre, v} = digs(this.props, "a", "filterIndex", "p", "pre", "v")

    this.props.onClick({a, filterIndex, p, pre, v})
  }

  onRemoveFilterClicked = (e) => {
    e.preventDefault()

    const {filterIndex} = digs(this.props, "filterIndex")

    this.props.onRemoveClicked({filterIndex})
  }
}))