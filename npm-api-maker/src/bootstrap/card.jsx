// @ts-check
/* eslint-disable sort-imports */
import React, {useRef} from "react"
import {digg, digs} from "diggerize"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import classNames from "classnames" // eslint-disable-line import/no-unresolved
import PropTypes from "prop-types"
import memo from "set-state-compare/build/memo.js"

/**
 * @typedef {object} Props
 * @property {React.RefObject<HTMLDivElement | null>} [cardRef]
 * @property {React.ReactNode} [children]
 * @property {string} [className]
 * @property {React.ReactNode} [controls]
 * @property {boolean} [defaultExpanded]
 * @property {boolean} [expandable]
 * @property {boolean} [expandableHide]
 * @property {React.ReactNode} [footer]
 * @property {React.ReactNode} [header]
 * @property {boolean} [responsiveTable]
 * @property {boolean} [striped]
 * @property {boolean} [table]
 */
/**
 * @typedef {object} State
 * @property {boolean} expanded
 */
export default memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class ApiMakerBootstrapCard extends ShapeComponent {
  static defaultProps = {
    defaultExpanded: true,
    expandable: false,
    expandableHide: false,
    responsiveTable: true,
    table: false
  }

  static propTypes = {
    cardRef: PropTypes.object,
    children: PropTypes.any,
    className: PropTypes.string,
    controls: PropTypes.any,
    defaultExpanded: PropTypes.bool,
    expandable: PropTypes.bool,
    expandableHide: PropTypes.bool,
    footer: PropTypes.any,
    header: PropTypes.any,
    responsiveTable: PropTypes.bool,
    striped: PropTypes.bool,
    table: PropTypes.bool
  }

  state = {
    expanded: this.props.defaultExpanded
  }

  setup() {
    this.cardRef = useRef(undefined)
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

    if (!expanded) cardHeaderStyle.borderBottom = "0"

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
      if (responsiveTable) {
        classNames.push("table-responsive")
      }

      classNames.push("p-0")
    }

    return classNames.join(" ")
  }

  onCollapseClicked = (e) => {
    e.preventDefault()
    this.s.expanded = false
  }

  onExpandClicked = (e) => {
    e.preventDefault()
    this.s.expanded = true
  }

  tableClassNames () {
    const classNames = ["table", "table-hover", "mb-0", "w-100"]

    if (this.props.striped)
      classNames.push("table-striped")

    return classNames.join(" ")
  }
}))
