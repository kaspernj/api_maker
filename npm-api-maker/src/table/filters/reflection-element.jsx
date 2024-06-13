import {digg, digs} from "diggerize"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import {memo} from "react"
import Reflection from "../../base-model/reflection"
import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component"

export default memo(shapeComponent(class ReflectionElement extends ShapeComponent {
  static propTypes = PropTypesExact({
    currentModelClass: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
    reflection: PropTypes.instanceOf(Reflection).isRequired
  })

  render() {
    const {currentModelClass, reflection} = digs(this.props, "currentModelClass", "reflection")

    return (
      <div
        className="reflection-element"
        data-model-class={currentModelClass.modelClassData().name}
        data-reflection-name={reflection.name()}
        onClick={digg(this, "onReflectionClicked")}
      >
        {currentModelClass.humanAttributeName(reflection.name())}
      </div>
    )
  }

  onReflectionClicked = (e) => {
    e.preventDefault()

    this.props.onClick({reflection: digg(this, "props", "reflection")})
  }
}))
