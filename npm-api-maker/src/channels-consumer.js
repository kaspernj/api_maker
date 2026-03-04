import Config from "./config.js"
// @ts-expect-error
import {createConsumer} from "@rails/actioncable" // eslint-disable-line import/no-unresolved

/** @returns {any} */
export default () => {
  if (!globalThis.apiMakerChannelsConsumer) {
    // @ts-expect-error
    globalThis.apiMakerChannelsConsumer = createConsumer(Config.getCableUrl())
  }

  return globalThis.apiMakerChannelsConsumer
}
