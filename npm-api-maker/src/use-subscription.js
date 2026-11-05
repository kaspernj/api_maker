// @ts-check
import {ShapeHook, useShapeHook} from "set-state-compare"
import PropTypes from "prop-types"
import getChannelsConsumer from "./channels-consumer.js"
import propTypesExact from "prop-types-exact"
import {useLayoutEffect} from "react"

/** @typedef {string | number | boolean | null | Array<string | number | boolean | null>} SubscriptionArgumentValue */
/** @typedef {Record<string, SubscriptionArgumentValue>} SubscriptionArgs */
/** @typedef {Record<string, unknown>} SubscriptionPayload */
/** @typedef {(payload: SubscriptionPayload) => void} SubscriptionHandler */
/** @typedef {{active?: boolean, args: SubscriptionArgs, onReceive: SubscriptionHandler}} UseSubscriptionProps */

/** Hook state container for ActionCable channel subscriptions. */
class UseSubscriptionShapeHook extends ShapeHook {
  static defaultProps = {
    active: true
  }

  static propTypes = propTypesExact({
    active: PropTypes.bool,
    args: PropTypes.object.isRequired,
    onReceive: PropTypes.func.isRequired
  })

  /** @returns {void} */
  setup() {
    useLayoutEffect(() => {
      if (!this.p.active) {
        return
      }

      const subscription = getChannelsConsumer().subscriptions.create(this.p.args, {
        received: (payload) => this.onReceiveCallback(payload)
      })

      return () => {
        subscription.unsubscribe()
      }
    }, [this.p.active, JSON.stringify(this.p.args)])
  }

  /**
   * Forwards a channel payload to the handler of the current render.
   * @param {SubscriptionPayload} payload Channel payload.
   * @returns {void}
   */
  onReceiveCallback(payload) {
    if (!this.p.active) {
      return
    }

    this.p.onReceive(payload)
  }
}

/**
 * Subscribes to an ActionCable channel and unsubscribes when the component using the hook goes away or the channel arguments change.
 *
 * @param {UseSubscriptionProps} props args is the channel identifier, active defaults to true, onReceive gets every payload.
 * @returns {void}
 */
const apiMakerUseSubscription = (props) => {
  const {active = true, args, onReceive, ...restProps} = props

  if (Object.keys(restProps).length > 0) {
    throw new Error(`Unknown props given to apiMakerUseSubscription: ${Object.keys(restProps).join(", ")}`)
  }

  useShapeHook(UseSubscriptionShapeHook, {active, args, onReceive})
}

export default apiMakerUseSubscription
