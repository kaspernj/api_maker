import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React from "react"

export default class Card extends React.Component {
  static propTypes = PropTypesExact({
    className: PropTypes.string,
    children: PropTypes.node,
    controls: PropTypes.node,
    header: PropTypes.string,
    onClick: PropTypes.func,
    striped: PropTypes.bool,
    style: PropTypes.object,
    table: PropTypes.bool
  })

  render() {
    var { children, controls, header, onClick, style, table } = this.props

    return (
      <div className={this.classNames()} onClick={onClick} style={style}>
        {(controls || header) &&
          <div className="card-header">
            {header}
            {controls &&
              <div className="float-right">
                {controls}
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
    var classNames = ["component-bootstrap-card", "card", "card-default"]

    if (this.props.className)
      classNames.push(this.props.className)

    return classNames.join(" ")
  }

  bodyClassNames() {
    var classNames = ["card-body"]

    if (this.props.table) {
      classNames.push("table-responsive")
      classNames.push("p-0")
    }

    return classNames.join(" ")
  }

  tableClassNames() {
    var classNames = ["table", "table-hover", "mb-0", "w-100"]

    if (this.props.striped)
      classNames.push("table-striped")

    return classNames.join(" ")
  }
}
