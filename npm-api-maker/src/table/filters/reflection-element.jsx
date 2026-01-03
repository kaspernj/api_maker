/* eslint-disable new-cap, sort-imports */
import BaseComponent from "../../base-component"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import memo from "set-state-compare/build/memo.js"
import {Pressable} from "react-native"
import React from "react"
import {shapeComponent} from "set-state-compare/build/shape-component.js"
import Text from "../../utils/text"

export default memo(shapeComponent(class ReflectionElement extends BaseComponent {
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
        dataSet={{
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
