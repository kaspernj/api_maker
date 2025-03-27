import BaseComponent from "../base-component"
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome"
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5"
import FontAwesome6Icon from "react-native-vector-icons/FontAwesome6"
import MaterialIconsIcon from "react-native-vector-icons/MaterialIcons"
import memo from "set-state-compare/src/memo"
import React, {useMemo} from "react"
import {shapeComponent} from "set-state-compare/src/shape-component"
import {useMergedStyle} from "./default-style"

export default memo(shapeComponent(class ApiMakerUtilsIcon extends BaseComponent {
  render() {
    const {style, version = "FontAwesome", ...restProps} = this.props
    const {stylesList} = useMergedStyle(style, "Text")

    // Only forward some styles like color
    const actualStylesList = useMemo(() => {
      const actualStylesList = []

      for (const style of stylesList) {
        const newStyle = {}
        let count = 0

        for (const key in style) {
          if (key == "color") {
            newStyle[key] = style[key]
            count++
          }
        }

        if (count > 0) {
          actualStylesList.push(newStyle)
        }
      }

      return actualStylesList
    }, [stylesList, style])

    if (version == "FontAwesome") {
      return <FontAwesomeIcon style={actualStylesList} {...restProps} />
    } else if (version == "FontAwesome5") {
      return <FontAwesome5Icon style={actualStylesList} {...restProps} />
    } else if (version == "FontAwesome6") {
      return <FontAwesome6Icon style={actualStylesList} {...restProps} />
    } else if (version == "MaterialIcons") {
      return <MaterialIconsIcon style={actualStylesList} {...restProps} />
    } else {
      throw new Error(`Unknown version: ${version}`)
    }
  }
}))
