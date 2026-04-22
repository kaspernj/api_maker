// @ts-check
import {StyleSheet} from "react-native"

/** @typedef {import("react-native").ImageStyle | import("react-native").TextStyle | import("react-native").ViewStyle} MergeableStyle */
/** @typedef {false | null | undefined | MergeableStyle | MergeableStyle[]} MergeableStyleEntry */

/**
 * Merge style inputs into a flat style object.
 * @param {MergeableStyleEntry[]} stylesList
 * @returns {MergeableStyle}
 */
export default function mergeStyles(stylesList) {
  const mergedStyle = /** @type {MergeableStyle} */ ({})

  for (const style of stylesList) {
    if (typeof style == "object") {
      Object.assign(mergedStyle, StyleSheet.flatten(style))
    } else if (style === null) {
      // Ignore - do nothing
    }
  }

  return mergedStyle
}
