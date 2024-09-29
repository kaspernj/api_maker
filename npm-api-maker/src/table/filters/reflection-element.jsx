import BaseComponent from "../../base-component"
import {digg} from "diggerize"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import {memo} from "react"
import {Pressable, Text} from "react-native"
import Reflection from "../../base-model/reflection"
import {shapeComponent} from "set-state-compare/src/shape-component"

export default memo(shapeComponent(class ReflectionElement extends BaseComponent {
  static propTypes = PropTypesExact({
    currentModelClass: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
    reflectionName: PropTypes.string.isRequired
  })

  render() {
    const {currentModelClass, reflectionName} = this.p

    return (
      <Pressable
        dataSet={{
          class: "reflection-element",
          modelClass: currentModelClass.modelClassData().name,
          reflectionName: reflectionName
        }}
        onPress={digg(this, "onReflectionClicked")}
      >
        <Text>
          {currentModelClass.humanAttributeName(reflectionName)}
        </Text>
      </Pressable>
    )
  }

  onReflectionClicked = () => this.p.onClick({reflectionName: this.p.reflectionName})
}))
