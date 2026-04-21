// @ts-check
import Config from "./config.js"
// @ts-expect-error
import {createConsumer} from "@rails/actioncable" // eslint-disable-line import/no-unresolved

/**
 * @typedef {object | string | number | boolean | null | Array<object | string | number | boolean | null>} ActionCablePayloadValue
 * @typedef {object} ActionCableSubscription
 * @property {(action: string, data: {[key: string]: ActionCablePayloadValue}) => void} perform
 * @property {() => void} unsubscribe
 * @typedef {object} ActionCableChannelCallbacks
 * @property {(() => void)=} connected
 * @property {(() => void)=} disconnected
 * @property {((data: {[key: string]: ActionCablePayloadValue}) => void)=} received
 * @property {(() => void)=} rejected
 * @typedef {object} ActionCableConsumer
 * @property {() => void} disconnect
 * @property {{create: (channel: string | {channel: string}, callbacks?: ActionCableChannelCallbacks) => ActionCableSubscription}} subscriptions
 */

/** @returns {ActionCableConsumer} */
export default () => {
  const globalChannelsConsumer = /** @type {{apiMakerChannelsConsumer?: ActionCableConsumer}} */ (globalThis)

  if (!globalChannelsConsumer.apiMakerChannelsConsumer) {
    globalChannelsConsumer.apiMakerChannelsConsumer = /** @type {ActionCableConsumer} */ (createConsumer(Config.getCableUrl()))
  }

  return globalChannelsConsumer.apiMakerChannelsConsumer
}

/** @returns {void} */
export const resetChannelsConsumer = () => {
  const globalChannelsConsumer = /** @type {{apiMakerChannelsConsumer?: ActionCableConsumer}} */ (globalThis)

  if (!globalChannelsConsumer.apiMakerChannelsConsumer) {
    return
  }

  globalChannelsConsumer.apiMakerChannelsConsumer.disconnect()
  delete globalChannelsConsumer.apiMakerChannelsConsumer
}
