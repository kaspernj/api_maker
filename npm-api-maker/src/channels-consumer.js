import Config from "./config.js"
import {createConsumer} from "@rails/actioncable" // eslint-disable-line import/no-unresolved

export default () => {
  if (!globalThis.apiMakerChannelsConsumer) {
    globalThis.apiMakerChannelsConsumer = createConsumer(Config.getCableUrl())
  }

  return globalThis.apiMakerChannelsConsumer
}
