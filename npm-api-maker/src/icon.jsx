import BaseComponent from "./base-component"
import {Image} from "react-native"
import {memo, useMemo} from "react"
import PropTypes from "prop-types"
import {shapeComponent} from "set-state-compare/src/shape-component.js"

export default memo(shapeComponent(class ComponentsIcon extends BaseComponent {
  static propTypes = {
    icon: PropTypes.string.isRequired
  }

  setup() {
    const {icon} = this.p

    this.useStates({
      IconComponent: null,
      imageSource: null
    })

    useMemo(() => {
      this.loadIcon()
    }, [icon])
  }

  async loadIcon() {
    const {icon} = this.p
    const IconComponent = await import(`./icons/${icon}.svg`)

    this.setState({IconComponent})
  }

  render() {
    const {icon, style, ...restProps} = this.props
    const {IconComponent} = this.s
    const actualStyle = Object.assign(
      {
        width: 16,
        height: 16
      },
      style
    )

    if (!IconComponent) {
      return null
    }

    return (
      <Image source={IconComponent.default} style={actualStyle} {...restProps} />
    )
  }
}))
