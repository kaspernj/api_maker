import React, {useMemo} from "react"
import classNames from "classnames"
import memo from "set-state-compare/src/memo"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component"
import Text from "./text"

export default memo(shapeComponent(class ApiMakerUtilsCard extends ShapeComponent {
  static propTypes = propTypesExact({
    children: PropTypes.node,
    controls: PropTypes.node,
    dataSet: PropTypes.object,
    header: PropTypes.string,
    style: PropTypes.object
  })

  render() {
    const {children, controls, dataSet, header, style} = this.props
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
      <View dataSet={actualDataSet} style={actualStyle}>
        {controls &&
          <View style={this.controlsViewStyle ||= {position: "absolute", top: 15, right: 15}}>
            {controls}
          </View>
        }
        {header &&
          <Text style={this.headerTextStyle ||= {fontSize: 24}}>
            {header}
          </Text>
        }
        {children}
      </View>
    )
  }
}))
