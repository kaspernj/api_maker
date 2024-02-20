import "./style"
import classNames from "classnames"
import Link from "../../../../link"
import {memo} from "react"
import PropTypes from "prop-types"

const ComponentsAdminLayoutMenuMenuItem = ({active, children, className, icon, identifier, label, to, ...restProps}) => {
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

ComponentsAdminLayoutMenuMenuItem.propTypes = {
  active: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  className: PropTypes.string,
  icon: PropTypes.string.isRequired,
  label: PropTypes.node
}

export default memo(ComponentsAdminLayoutMenuMenuItem)
