import BaseComponent from "../../base-component.js"
import {digg} from "diggerize"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import memo from "set-state-compare/src/memo.js"
import {Pressable} from "react-native"
import React from "react"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import Text from "../../utils/text.jsx"

export default memo(shapeComponent(class AttributeElement extends BaseComponent {
  static propTypes = PropTypesExact({
    active: PropTypes.bool.isRequired,
    attribute: PropTypes.object.isRequired,
    modelClassName: PropTypes.string.isRequired,
    fikter: PropTypes.object,
    onClick: PropTypes.func.isRequired
  })

  render() {
    const {active, attribute, modelClassName} = this.p
    const style = {}

    if (active) style.fontWeight = "bold"

    return (
      <Pressable
        dataSet={{
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
