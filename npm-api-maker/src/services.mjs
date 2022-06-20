import CommandsPool from "./commands-pool.mjs"

export default class ApiMakerServices {
  static current () {
    if (!global.currentApiMakerService) {
      global.currentApiMakerService = new ApiMakerServices()
    }

    return global.currentApiMakerService
  }

  sendRequest (serviceName, args) {
    return CommandsPool.addCommand({
      args: {
        service_args: args,
        service_name: serviceName
      },
      command: "services",
      collectionName: "calls",
      type: "service"
    })
  }
}
