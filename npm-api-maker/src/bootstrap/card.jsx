import {digs} from "diggerize"
import PropTypes from "prop-types"
import React from "react"

export default class ApiMakerBootstrapCard extends React.PureComponent {
  static defaultProps = {
    defaultExpanded: true,
    expandable: false,
    expandableHide: false,
    responsiveTable: true,
    table: false
  }

  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    controls: PropTypes.node,
    defaultExpanded: PropTypes.bool.isRequired,
    expandable: PropTypes.bool.isRequired,
    expandableHide: PropTypes.bool.isRequired,
    header: PropTypes.node,
    striped: PropTypes.bool,
    responsiveTable: PropTypes.bool.isRequired,
    table: PropTypes.bool.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
      expanded: props.defaultExpanded
    }
  }

  render () {
    const {
      children,
      className,
      controls,
      defaultExpanded,
      expandable,
      expandableHide,
      header,
      responsiveTable,
      striped,
      table,
      ...restProps
    } = this.props
    const {expanded} = digs(this.state, "expanded")

    return (
      <div className={this.classNames()} ref="card" {...restProps}>
        {(controls || expandable || header) &&
          <div className={`card-header d-flex ${!expanded && "border-bottom-0"}`}>
            <div style={{alignSelf: "center", marginRight: "auto"}}>
              {header}
            </div>
            {(controls || expandable) &&
              <div style={{alignSelf: "center"}}>
                {controls}
                {expandable && expanded &&
                  <a className="collapse-card-button text-muted" href="#" onClick={this.onCollapseClicked}>
                    <i className="la la-angle-up" />
                  </a>
                }
                {expandable && !expanded &&
                  <a className="expand-card-button text-muted" href="#" onClick={this.onExpandClicked}>
                    <i className="la la-angle-down" />
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
      </div>
    )
  }

  classNames () {
    const classNames = ["component-bootstrap-card", "card", "card-default"]

    if (this.props.className)
      classNames.push(this.props.className)

    return classNames.join(" ")
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
}
