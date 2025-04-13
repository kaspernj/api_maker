import BaseComponent from "../base-component"
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome"
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5"
import FontAwesome6Icon from "react-native-vector-icons/FontAwesome6"
import MaterialIconsIcon from "react-native-vector-icons/MaterialIcons"
import memo from "set-state-compare/src/memo"
import React, {useMemo} from "react"
import {shapeComponent} from "set-state-compare/src/shape-component"
import {useMergedStyle} from "./default-style"

const FontAwesomeGlyphMap = FontAwesomeIcon.getRawGlyphMap()
const FontAwesome5GlyphMap = FontAwesome5Icon.getRawGlyphMap()
const FontAwesome6GlyphMap = FontAwesome6Icon.getRawGlyphMap()
const MaterialIconsGlyphMap = MaterialIconsIcon.getRawGlyphMap()

export default memo(shapeComponent(class ApiMakerUtilsIcon extends BaseComponent {
  render() {
    const {name, style, version, ...restProps} = this.props
    const {stylesList} = useMergedStyle(style, "Text")
    let actualVersion = version

    if (!actualVersion) {
      if (name in FontAwesome6GlyphMap) {
        actualVersion = "FontAwesome6"
      } else if (name in FontAwesome5GlyphMap) {
        actualVersion = "FontAwesome5"
      } else if (name in FontAwesomeGlyphMap) {
        actualVersion = "FontAwesome"
      } else if (name in MaterialIconsGlyphMap) {
        actualVersion =  "MaterialIcons"
      }
    }

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

    if (actualVersion == "FontAwesome") {
      return <FontAwesomeIcon name={name} style={actualStylesList} {...restProps} />
    } else if (actualVersion == "FontAwesome5") {
      return <FontAwesome5Icon name={name} style={actualStylesList} {...restProps} />
    } else if (actualVersion == "FontAwesome6") {
      return <FontAwesome6Icon name={name} style={actualStylesList} {...restProps} />
    } else if (actualVersion == "MaterialIcons") {
      return <MaterialIconsIcon name={name} style={actualStylesList} {...restProps} />
    } else {
      throw new Error(`Unknown version: ${actualVersion}`)
    }
  }
}))
