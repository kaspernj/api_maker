import {shapeComponent, ShapeComponent} from "set-state-compare/build/shape-component.js"
import memo from "set-state-compare/build/memo.js"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import React from "react"
import Text from "./text"

export default memo(shapeComponent(class ApiMakerUtilsInvalidFeedback extends ShapeComponent {
  static propTypes = propTypesExact({
    message: PropTypes.string.isRequired
  })

  render() {
    return (
      <Text style={this.textStyle ||= {color: "red"}}>
        {this.p.message}
      </Text>
    )
  }
}))
