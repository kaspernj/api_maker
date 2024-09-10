import {Image} from "react-native"

export default memo(shapeComponent(class ComponentsIcon extends ShapeComponent {
  static propTypes = propTypesExact({
    icon: PropTypes.string.isRequired,
    iconProps: PropTypes.object
  })

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
