import Config from "./config.js"
// @ts-expect-error
import {createConsumer} from "@rails/actioncable" // eslint-disable-line import/no-unresolved

/** @returns {any} */
export default () => {
  if (!globalThis.apiMakerChannelsConsumer) {
    globalThis.apiMakerChannelsConsumer = createConsumer(Config.getCableUrl())
  }

  return globalThis.apiMakerChannelsConsumer
}

/** @returns {void} */
export const resetChannelsConsumer = () => {
  if (!globalThis.apiMakerChannelsConsumer) {
    return
  }

  globalThis.apiMakerChannelsConsumer.disconnect()
  delete globalThis.apiMakerChannelsConsumer
}
