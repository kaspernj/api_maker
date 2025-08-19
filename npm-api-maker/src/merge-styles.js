import {StyleSheet} from "react-native"

export default function mergeStyles(stylesList) {
  const mergedStyle = {}

  for (const style of stylesList) {
    if (typeof style == "object") {
      Object.assign(mergedStyle, StyleSheet.flatten(style))
    } else if (style === null) {
      // Ignore - do nothing
    }
  }

  return mergedStyle
}
