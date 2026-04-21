// @ts-check
/* eslint-disable arrow-body-style, prefer-arrow-callback, prefer-object-spread, sort-imports */
import Text from "./text"
import React from "react"

/** @typedef {import("react").ComponentProps<typeof Text>} HeaderProps */

export default React.memo(function ApiMakerUtilsHeader(/** @type {HeaderProps} */ props) {
  const {style, ...restProps} = props

  const actualStyle = React.useMemo(() => {
    return Object.assign({marginBottom: 5, fontSize: 18, fontWeight: "bold"}, style)
  }, [style])

  return (
    <Text style={actualStyle} {...restProps} />
  )
})
