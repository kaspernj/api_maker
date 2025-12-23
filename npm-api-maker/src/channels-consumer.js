import Config from "./config.js"
// @ts-ignore
import {createConsumer} from "@rails/actioncable"

export default () => {
  if (!globalThis.apiMakerChannelsConsumer) {
    globalThis.apiMakerChannelsConsumer = createConsumer(Config.getCableUrl())
  }

  return globalThis.apiMakerChannelsConsumer
}
