import CommandsPool from "./commands-pool.js"

const shared = {}

/** API service command proxy. */
export default class ApiMakerServices {
  /** @returns {ApiMakerServices} */
  static current () {
    if (!shared.currentApiMakerService) shared.currentApiMakerService = new ApiMakerServices()

    return shared.currentApiMakerService
  }

  /**
   * @param {string} serviceName
   * @param {Record<string, any>} args
   * @param {Record<string, any>} [options]
   * @returns {Promise<any>}
   */
  sendRequest (serviceName, args, options = {}) {
    return CommandsPool.addCommand({
      args: {
        service_args: args,
        service_name: serviceName
      },
      command: "services",
      collectionName: "calls",
      type: "service"
    }, options)
  }
}
