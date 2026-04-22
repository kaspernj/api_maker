// @ts-check
import CommandsPool from "./commands-pool.js"

const shared = {}

/** @typedef {object | string | number | boolean | null | undefined | Array<object | string | number | boolean | null | undefined>} ServiceValue */
/** @typedef {Record<string, ServiceValue>} ServiceArgs */
/**
 * @typedef {object} ServiceRequestOptions
 * @property {boolean} [cacheResponse]
 * @property {boolean} [forceHttp]
 * @property {ServiceArgs} [global]
 * @property {(value: string) => void} [onLog]
 * @property {(value: {count?: number, progress?: number, total?: number}) => void} [onProgress]
 * @property {(value: ServiceArgs) => void} [onReceived]
 */

/** API service command proxy. */
export default class ApiMakerServices {
  /** @returns {ApiMakerServices} */
  static current () {
    if (!shared.currentApiMakerService) shared.currentApiMakerService = new ApiMakerServices()

    return shared.currentApiMakerService
  }

  /**
   * @param {string} serviceName
   * @param {ServiceArgs} [args]
   * @param {ServiceRequestOptions} [options]
   * @returns {import("./command-execution.js").default}
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
