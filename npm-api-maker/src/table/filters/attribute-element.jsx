// @ts-check
/* eslint-disable new-cap, no-return-assign, sort-imports */
import {digg} from "diggerize"
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
export default memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class AttributeElement extends ShapeComponent {
  static propTypes = PropTypesExact({
    active: PropTypes.bool.isRequired,
    attribute: PropTypes.object.isRequired,
    modelClassName: PropTypes.string.isRequired,
    fikter: PropTypes.object,
    onClick: PropTypes.func.isRequired
  })

  render() {
    const {active, attribute, modelClassName} = this.p
    const style = active ? /** @type {import("react-native").TextStyle} */ ({fontWeight: "bold"}) : undefined

    return (
      <Pressable
        dataSet={dataSets[`attribute-${digg(attribute, "attributeName")}-${modelClassName}`] ||= {
          class: "attribute-element",
          attributeName: digg(attribute, "attributeName"),
          modelClass: modelClassName
        }}
        onPress={this.tt.onAttributeClicked}
      >
        <Text style={style}>
          {digg(attribute, "humanName")}
        </Text>
      </Pressable>
    )
  }

  onAttributeClicked = (e) => {
    e.preventDefault()

    this.p.onClick({attribute: this.p.attribute})
  }
}))
