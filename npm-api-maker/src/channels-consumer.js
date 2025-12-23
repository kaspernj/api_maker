import Config from "./config.js"
// @ts-ignore
import {createConsumer} from "@rails/actioncable"

export default () => {
  /** @type {any} */
  const typedConfig = Config

  if (!globalThis.apiMakerChannelsConsumer) {
    globalThis.apiMakerChannelsConsumer = createConsumer(typedConfig.getCableUrl())
  }

  return globalThis.apiMakerChannelsConsumer
}
