import "./style"
import BaseComponent from "../../../../base-component"
import classNames from "classnames"
import Link from "../../../../link"
import {memo} from "react"
import PropTypes from "prop-types"
import {shapeComponent} from "set-state-compare/src/shape-component.js"

export default memo(shapeComponent(class ComponentsAdminLayoutMenuMenuItem extends BaseComponent {
  static propTypes = {
    active: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    className: PropTypes.string,
    icon: PropTypes.string.isRequired,
    label: PropTypes.node
  }

  render() {
    const {active, children, className, icon, identifier, label, to, ...restProps} = this.props

    return (
      <Link
        className={classNames("components--admin--layout--menu--menu-item", className)}
        data-active={active === true || active == identifier}
        data-identifier={identifier}
        to={to || "#"}
        {...restProps}
      >
        <i className={`fa fa-fw fa-${icon} menu-item-icon`} />
        {children || label}
      </Link>
    )
  }
}))
