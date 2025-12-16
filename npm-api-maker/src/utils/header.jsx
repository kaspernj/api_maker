import Text from "./text"
import React from "react"

export default React.memo(function ApiMakerUtilsHeader(props) {
  const {style, ...restProps} = props

  const actualStyle = React.useMemo(() => {
    return Object.assign({marginBottom: 5, fontSize: 18, fontWeight: "bold"}, style)
  }, [style])

  return (
    <Text style={actualStyle} {...restProps} />
  )
})
