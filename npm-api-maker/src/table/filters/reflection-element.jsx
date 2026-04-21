// @ts-check
/* eslint-disable new-cap, no-return-assign, sort-imports */
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import memo from "set-state-compare/build/memo.js"
import {Pressable} from "react-native"
import React from "react"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import Text from "../../utils/text"

const dataSets = {}

/** @typedef {Record<string, never>} Props */
/** @typedef {Record<string, never>} State */
export default memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class ReflectionElement extends ShapeComponent {
  static propTypes = PropTypesExact({
    modelClassName: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    reflection: PropTypes.object.isRequired
  })

  render() {
    const {modelClassName, reflection} = this.p
    const {humanName, reflectionName} = reflection

    return (
      <Pressable
        dataSet={dataSets[`reflection-${modelClassName}-${reflectionName}`] ||= {
          class: "reflection-element",
          modelClass: modelClassName,
          reflectionName
        }}
        onPress={this.tt.onReflectionClicked}
      >
        <Text>
          {humanName}
        </Text>
      </Pressable>
    )
  }

  onReflectionClicked = () => this.p.onClick({reflection: this.p.reflection})
}))
