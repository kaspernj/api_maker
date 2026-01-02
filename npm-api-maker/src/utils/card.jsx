import React, {useMemo} from "react"
import classNames from "classnames"
import memo from "set-state-compare/build/memo.js"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {shapeComponent, ShapeComponent} from "set-state-compare/build/shape-component.js"
import Text from "./text.js"
import {View} from "react-native"

export default memo(shapeComponent(class ApiMakerUtilsCard extends ShapeComponent {
  static propTypes = propTypesExact({
    children: PropTypes.any,
    controls: PropTypes.any,
    dataSet: PropTypes.object,
    header: PropTypes.string,
    style: PropTypes.object,
    testID: PropTypes.string
  })

  render() {
    const {children, controls, dataSet, header, style, testID} = this.props
    const {component, ...restDataSet} = dataSet || {}

    const actualDataSet = useMemo(() =>
      Object.assign(
        {component: classNames("api-maker/utils/card", component)},
        restDataSet
      )
    , [component, restDataSet])

    const actualStyle = useMemo(() =>
      Object.assign(
        {
          backgroundColor: "#fff",
          borderRadius: 15,
          padding: 30
        },
        style
      )
    , [style])

    return (
      <View dataSet={actualDataSet} style={actualStyle} testID={testID}>
        {controls &&
          <View style={this.cache("controlsViewStyle", {position: "absolute", top: 15, right: 15})}>
            {controls}
          </View>
        }
        {header &&
          <Text style={this.cache("headerTextStyle", {fontSize: 24})}>
            {header}
          </Text>
        }
        {children}
      </View>
    )
  }
}))
