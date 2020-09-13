import {digs} from "@kaspernj/object-digger"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React from "react"

export default class ApiMakerBootstrapCard extends React.Component {
  static defaultProps = {
    defaultExpanded: true,
    expandable: false,
    responsiveTable: true,
    table: false
  }

  static propTypes = PropTypesExact({
    className: PropTypes.string,
    children: PropTypes.node,
    controls: PropTypes.node,
    defaultExpanded: PropTypes.bool.isRequired,
    expandable: PropTypes.bool.isRequired,
    header: PropTypes.node,
    onClick: PropTypes.func,
    striped: PropTypes.bool,
    style: PropTypes.object,
    responsiveTable: PropTypes.bool.isRequired,
    table: PropTypes.bool.isRequired
  })

  constructor(props) {
    super(props)
    this.state = {
      expanded: props.defaultExpanded
    }
  }

  render() {
    const {children, controls, header, onClick, style, table} = this.props
    const {expandable} = digs(this.props, "expandable")
    const {expanded} = digs(this.state, "expanded")

    return (
      <div className={this.classNames()} onClick={onClick} ref="card" style={style}>
        {(controls || expandable || header) &&
          <div className={`card-header ${!expanded && "border-bottom-0"}`}>
            {header}
            {(controls || expandable) &&
              <div className="float-right">
                {controls}
                {expandable && expanded &&
                  <a className="collapse-card-button text-muted" href="#" onClick={(e) => this.onCollapseClicked(e)}>
                    <i className="la la-angle-up" />
                  </a>
                }
                {expandable && !expanded &&
                  <a className="expand-card-button text-muted" href="#" onClick={(e) => this.onExpandClicked(e)}>
                    <i className="la la-angle-down" />
                  </a>
                }
              </div>
            }
          </div>
        }
        <div className={this.bodyClassNames()}>
          {table &&
            <table className={this.tableClassNames()}>
              {children}
            </table>
          }
          {!table && children}
        </div>
      </div>
    )
  }

  classNames() {
    const classNames = ["component-bootstrap-card", "card", "card-default"]

    if (this.props.className)
      classNames.push(this.props.className)

    return classNames.join(" ")
  }

  bodyClassNames() {
    const {responsiveTable, table} = digs(this.props, "responsiveTable", "table")
    const {expanded} = digs(this.state, "expanded")
    const classNames = ["card-body"]

    if (!expanded) {
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

  onCollapseClicked(e) {
    e.preventDefault()
    this.setState({expanded: false})
  }

  onExpandClicked(e) {
    e.preventDefault()
    this.setState({expanded: true})
  }

  tableClassNames() {
    const classNames = ["table", "table-hover", "mb-0", "w-100"]

    if (this.props.striped)
      classNames.push("table-striped")

    return classNames.join(" ")
  }
}
