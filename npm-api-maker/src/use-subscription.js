// @ts-check
import {useLayoutEffect, useRef} from "react"
import getChannelsConsumer from "./channels-consumer.js"

/** @typedef {string | number | boolean | null | Array<string | number | boolean | null>} SubscriptionArgumentValue */
/** @typedef {Record<string, SubscriptionArgumentValue>} SubscriptionArgs */
/** @typedef {Record<string, unknown>} SubscriptionPayload */
/** @typedef {(payload: SubscriptionPayload) => void} SubscriptionHandler */
/** @typedef {{active?: boolean, args: SubscriptionArgs, onReceive: SubscriptionHandler}} UseSubscriptionProps */

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

  const argsKey = JSON.stringify(args)
  const latestRef = useRef({args, onReceive})

  useLayoutEffect(() => {
    latestRef.current = {args, onReceive}
  }, [args, onReceive])

  useLayoutEffect(() => {
    if (!active || !argsKey) {
      return
    }

    const subscription = getChannelsConsumer().subscriptions.create(latestRef.current.args, {
      received(payload) {
        latestRef.current.onReceive(payload)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [active, argsKey])
}

export default apiMakerUseSubscription
