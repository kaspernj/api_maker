import Attribute from "../../base-model/attribute"
import BaseComponent from "../../base-component"
import {digg} from "diggerize"
import * as inflection from "inflection"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import {memo} from "react"
import {Pressable, Text} from "react-native"
import {shapeComponent} from "set-state-compare/src/shape-component"

export default memo(shapeComponent(class AttributeElement extends BaseComponent {
  static propTypes = PropTypesExact({
    active: PropTypes.bool.isRequired,
    attribute: PropTypes.instanceOf(Attribute).isRequired,
    currentModelClass: PropTypes.func.isRequired,
    fikter: PropTypes.object,
    onClick: PropTypes.func.isRequired
  })

  render() {
    const {active, attribute, currentModelClass} = this.p
    const style = {}

    if (active) style.fontWeight = "bold"

    return (
      <Pressable
        dataSet={{
          class: "attribute-element",
          attributeName: attribute.name(),
          modelClass: currentModelClass.modelClassData().name
        }}
        onPress={digg(this, "onAttributeClicked")}
      >
        <Text style={style}>
          {currentModelClass.humanAttributeName(inflection.camelize(attribute.name(), true))}
        </Text>
      </Pressable>
    )
  }

  onAttributeClicked = (e) => {
    e.preventDefault()

    this.p.onClick({attribute: this.p.attribute})
  }
}))
