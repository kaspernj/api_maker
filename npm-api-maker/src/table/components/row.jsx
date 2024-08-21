export default memo(shapeComponent(class SharedTableRow extends ShapeComponent {
  render() {
    const {style, ...restProps} = this.props
    const actualStyle = Object.assign(
      {
        flexDirection: "row"
      },
      style
    )

    return (
      <View style={actualStyle} {...restProps} />
    )
  }
}))
