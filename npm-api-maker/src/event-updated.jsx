import BaseComponent from "./base-component"
import memo from "set-state-compare/src/memo"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import useUpdatedEvent from "./use-updated-event.mjs"

export default memo(shapeComponent(class ApiMakerEventUpdated extends BaseComponent {
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
    const {model, onUpdated, ...restProps} = this.props

    useUpdatedEvent(model, onUpdated, restProps)

    return null
  }
}))
