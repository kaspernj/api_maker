import {memo} from "react"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component.js"
import useUpdatedEvent from "./use-updated-event.mjs"

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
    useUpdatedEvent(model, onDestroyed, restProps)

    return null
  }
}))
