import React from "react"

export default class Card extends React.Component {
  render() {
    return (
      <div className={this.classNames()}>
        {(this.props.controls || this.props.header) &&
          <div className="card-header">
            {this.props.header}
            {this.props.controls &&
              <div className="pull-right">
                {this.props.controls}
              </div>
            }
          </div>
        }
        <div className={this.bodyClassNames()}>
          {this.props.table &&
            <table className={this.tableClassNames()}>
              {this.props.children}
            </table>
          }
          {!this.props.table && this.props.children}
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

Card.propTypes = {
  className: PropTypes.string,
  header: PropTypes.string,
  striped: PropTypes.bool,
  table: PropTypes.bool
}
