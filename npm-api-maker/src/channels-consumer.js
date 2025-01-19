import {createConsumer} from "@rails/actioncable"

export default () => {
  if (!globalThis.apiMakerChannelsConsumer) {
    globalThis.apiMakerChannelsConsumer = createConsumer()
  }

  return globalThis.apiMakerChannelsConsumer
}
