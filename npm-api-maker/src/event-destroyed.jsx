import memo from "set-state-compare/src/memo"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component.js"
import useDestroyedEvent from "./use-destroyed-event.mjs"

export default memo(shapeComponent(class ApiMakerEventDestroyed extends ShapeComponent {
  static propTypes = propTypesExact({
    active: PropTypes.bool,
    debounce: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.number
    ]),
    model: PropTypes.object.isRequired,
    onConnected: PropTypes.func,
    onUpdated: PropTypes.func.isRequired
  })

  render() {
    const {model, onDestroyed, ...restProps} = this.props
    useDestroyedEvent(model, onDestroyed, restProps)

    return null
  }
}))
