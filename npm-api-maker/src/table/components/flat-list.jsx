import {FlatList} from "react-native"

export default memo(shapeComponent(class SharedTagble extends ShapeComponent {
  render() {
    const {style, ...restProps} = this.props
    const actualStyle = Object.assign(
      {width: "100%"},
      style
    )

    return (
      <FlatList style={actualStyle} {...restProps} />
    )
  }
}))
