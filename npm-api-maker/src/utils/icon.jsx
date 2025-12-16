import BaseComponent from "../base-component.js"
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome.js"
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5.js"
import FontAwesome6Icon from "react-native-vector-icons/FontAwesome6.js"
import MaterialIconsIcon from "react-native-vector-icons/MaterialIcons.js"
import memo from "set-state-compare/src/memo.js"
import React, {useMemo} from "react"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import {useMergedStyle} from "./default-style.jsx"

const FontAwesomeGlyphMap = FontAwesomeIcon.getRawGlyphMap()
const FontAwesome5GlyphMap = FontAwesome5Icon.getRawGlyphMap()
const FontAwesome6GlyphMap = FontAwesome6Icon.getRawGlyphMap()
const MaterialIconsGlyphMap = MaterialIconsIcon.getRawGlyphMap()

const iconMap = {
  pencil: "FontAwesome",
  remove: "FontAwesome",
  search: "FontAwesome"
}

export default memo(shapeComponent(class ApiMakerUtilsIcon extends BaseComponent {
  render() {
    const {dataSet, name, style, version, ...restProps} = this.props
    const {stylesList} = useMergedStyle(style, "Text")
    let actualVersion = version

    if (!actualVersion) {
      if (name in iconMap) {
        actualVersion = iconMap[name]
      } else if (name in FontAwesome6GlyphMap) {
        actualVersion = "FontAwesome6"
      } else if (name in FontAwesome5GlyphMap) {
        actualVersion = "FontAwesome5"
      } else if (name in FontAwesomeGlyphMap) {
        actualVersion = "FontAwesome"
      } else if (name in MaterialIconsGlyphMap) {
        actualVersion =  "MaterialIcons"
      } else {
        actualVersion = "FontAwesome"
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

    const actualDataSet = useMemo(() => Object.assign({name, version: actualVersion}, dataSet), [actualVersion, dataSet, name])

    if (actualVersion == "FontAwesome") {
      return <FontAwesomeIcon dataSet={actualDataSet} name={name} style={actualStylesList} {...restProps} />
    } else if (actualVersion == "FontAwesome5") {
      return <FontAwesome5Icon dataSet={actualDataSet} name={name} style={actualStylesList} {...restProps} />
    } else if (actualVersion == "FontAwesome6") {
      return <FontAwesome6Icon dataSet={actualDataSet} name={name} style={actualStylesList} {...restProps} />
    } else if (actualVersion == "MaterialIcons") {
      return <MaterialIconsIcon dataSet={actualDataSet} name={name} style={actualStylesList} {...restProps} />
    } else {
      throw new Error(`Unknown version: ${actualVersion}`)
    }
  }
}))
