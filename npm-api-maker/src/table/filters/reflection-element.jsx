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
    reflection: PropTypes.instanceOf(Reflection).isRequired
  })

  render() {
    const {currentModelClass, reflection} = this.p

    return (
      <Pressable
        dataSet={{
          class: "reflection-element",
          modelClass: currentModelClass.modelClassData().name,
          reflectionName: reflection.name()
        }}
        onPress={digg(this, "onReflectionClicked")}
      >
        <Text>
          {currentModelClass.humanAttributeName(reflection.name())}
        </Text>
      </Pressable>
    )
  }

  onReflectionClicked = (e) => {
    e.preventDefault()

    this.p.onClick({reflection: digg(this, "props", "reflection")})
  }
}))
