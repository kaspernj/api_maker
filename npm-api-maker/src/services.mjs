import CommandsPool from "./commands-pool.mjs"

const shared = {}

export default class ApiMakerServices {
  static current () {
    if (!shared.currentApiMakerService) shared.currentApiMakerService = new ApiMakerServices()

    return shared.currentApiMakerService
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
