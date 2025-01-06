import "./style"
import BaseComponent from "../../../../base-component"
import classNames from "classnames"
import Link from "../../../../link"
import memo from "set-state-compare/src/memo"
import PropTypes from "prop-types"
import {shapeComponent} from "set-state-compare/src/shape-component"
import Text from "../../../../utils/text"

export default memo(shapeComponent(class ComponentsAdminLayoutMenuMenuItem extends BaseComponent {
  static propTypes = {
    active: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    className: PropTypes.string,
    icon: PropTypes.string.isRequired,
    label: PropTypes.node
  }

  setup() {
    this.useStates({
      hover: false
    })
  }

  render() {
    const {active, children, className, icon, identifier, label, to, ...restProps} = this.props
    const {hover} = this.s
    const textStyle = {}
    const style = {
      display: "flex",
      width: "80%",
      alignItems: "center",
      paddingTop: 10,
      paddingRight: 14,
      paddingBottom: 10,
      paddingLeft: 14,
      marginLeft: "auto",
      marginRight: "auto"
    }
    const isActive = active === true || active == identifier

    if (isActive || hover) {
      style.background = "#323435"
      style.borderRadius = 7
      textStyle.color = "#b9b9bb"
    } else {
      textStyle.color = "#6f6f71"
    }

    return (
      <Link
        dataSet={{
          active: isActive,
          class: classNames("components--admin--layout--menu--menu-item", className),
          identifier
        }}
        onPointerEnter={this.tt.onPointerEnter}
        onPointerLeave={this.tt.onPointerLeave}
        style={style}
        to={to || "#"}
        {...restProps}
      >
        <i className={`fa fa-fw fa-${icon} menu-item-icon`} style={{color: textStyle.color}} />
        {children || <Text style={textStyle}>{label}</Text>}
      </Link>
    )
  }

  onPointerEnter = () => this.setState({hover: true})
  onPointerLeave = () => this.setState({hover: false})
}))
