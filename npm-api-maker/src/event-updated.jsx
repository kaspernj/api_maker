import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {memo} from "react"
import useUpdatedEvent from "./use-updated-event.mjs"

const ApiMakerEventUpdated = ({model, onUpdated, ...restProps}) => {
  useUpdatedEvent(model, onUpdated, restProps)

  return null
}

ApiMakerEventUpdated.propTypes = propTypesExact({
  active: PropTypes.bool.isRequired,
  debounce: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.number
  ]),
  model: PropTypes.object.isRequired,
  onConnected: PropTypes.func,
  onUpdated: PropTypes.func.isRequired
})

export default memo(ApiMakerEventUpdated)
