import debounce from "debounce"
import ModelEvents from "./model-events.mjs"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import React from "react"

export default class ApiMakerEventUpdated extends React.PureComponent {
  static defaultProps = {
    active: true
  }

  static propTypes = propTypesExact({
    active: PropTypes.bool.isRequired,
    debounce: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.number
    ]),
    model: PropTypes.object.isRequired,
    onConnected: PropTypes.func,
    onUpdated: PropTypes.func.isRequired
  })

  componentDidMount () {
    this.connect()
  }

  componentWillUnmount () {
    if (this.connectUpdated) {
      this.connectUpdated.unsubscribe()
    }

    if (this.onConnectedListener) {
      this.connectUpdated.events.removeListener("connected", this.props.onConnected)
    }
  }

  connect () {
    const {model, onConnected} = this.props

    this.connectUpdated = ModelEvents.connectUpdated(model, this.onUpdated)

    if (onConnected) {
      this.onConnectedListener = this.connectUpdated.events.addListener("connected", this.props.onConnected)
    }
  }

  debounce () {
    if (!this.debounceInstance) {
      if (typeof this.props.debounce == "number") {
        this.debounceInstance = debounce(this.props.onUpdated, this.props.debounce)
      } else {
        this.debounceInstance = debounce(this.props.onUpdated)
      }
    }

    return this.debounceInstance
  }

  onUpdated = (...args) => {
    if (!this.props.active) {
      return
    }

    if (this.props.debounce) {
      this.debounce()(...args)
    } else {
      this.props.onUpdated(...args)
    }
  }

  render = () => null
}
