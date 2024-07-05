import BaseComponent from "../base-component"
import classNames from "classnames"
import {digg, digs} from "diggerize"
import PropTypes from "prop-types"
import {memo} from "react"
import {shapeComponent} from "set-state-compare/src/shape-component.js"

export default memo(shapeComponent(class ApiMakerBootstrapCard extends BaseComponent {
  static defaultProps = {
    defaultExpanded: true,
    expandable: false,
    expandableHide: false,
    responsiveTable: true,
    table: false
  }

  static propTypes = {
    cardRef: PropTypes.object,
    className: PropTypes.string,
    children: PropTypes.node,
    controls: PropTypes.node,
    defaultExpanded: PropTypes.bool.isRequired,
    expandable: PropTypes.bool.isRequired,
    expandableHide: PropTypes.bool.isRequired,
    footer: PropTypes.node,
    header: PropTypes.node,
    striped: PropTypes.bool,
    responsiveTable: PropTypes.bool.isRequired,
    table: PropTypes.bool.isRequired
  }

  setup() {
    this.cardRef = useRef()

    this.useStates({
      expanded: this.props.defaultExpanded
    })
  }

  render () {
    const {
      cardRef,
      children,
      className,
      controls,
      defaultExpanded,
      expandable,
      expandableHide,
      footer,
      header,
      responsiveTable,
      striped,
      table,
      ...restProps
    } = this.props
    const {expanded} = digs(this.state, "expanded")
    const cardHeaderStyle = {display: "flex"}
    const cardRefToUse = cardRef || this.cardRef

    if (!expanded) cardHeaderStyle["borderBottom"] = "0"

    return (
      <div
        className={classNames("component-bootstrap-card", "card", "card-default", className)}
        data-has-footer={Boolean(footer)}
        ref={cardRefToUse}
        {...restProps}
      >
        {(controls || expandable || header) &&
          <div className="card-header" style={cardHeaderStyle}>
            <div className="card-header-label" style={{alignSelf: "center", marginRight: "auto"}}>
              {header}
            </div>
            {(controls || expandable) &&
              <div className="card-header-actions" style={{alignSelf: "center"}}>
                {controls}
                {expandable && expanded &&
                  <a className="collapse-card-button text-muted" href="#" onClick={digg(this, "onCollapseClicked")}>
                    <i className="fa fa-angle-up" />
                  </a>
                }
                {expandable && !expanded &&
                  <a className="expand-card-button text-muted" href="#" onClick={digg(this, "onExpandClicked")}>
                    <i className="fa fa-angle-down" />
                  </a>
                }
              </div>
            }
          </div>
        }
        {(expanded || expandableHide) &&
          <div className={this.bodyClassNames()}>
            {table &&
              <table className={this.tableClassNames()}>
                {children}
              </table>
            }
            {!table && children}
          </div>
        }
        {footer &&
          <div className="card-footer">
            {footer}
          </div>
        }
      </div>
    )
  }

  bodyClassNames () {
    const {expandableHide, responsiveTable, table} = digs(this.props, "expandableHide", "responsiveTable", "table")
    const {expanded} = digs(this.state, "expanded")
    const classNames = ["card-body"]

    if (!expanded && expandableHide) {
      classNames.push("d-none")
    }

    if (table) {
      if (responsiveTable){
        classNames.push("table-responsive")
      }

      classNames.push("p-0")
    }

    return classNames.join(" ")
  }

  onCollapseClicked = (e) => {
    e.preventDefault()
    this.setState({expanded: false})
  }

  onExpandClicked = (e) => {
    e.preventDefault()
    this.setState({expanded: true})
  }

  tableClassNames () {
    const classNames = ["table", "table-hover", "mb-0", "w-100"]

    if (this.props.striped)
      classNames.push("table-striped")

    return classNames.join(" ")
  }
}))
