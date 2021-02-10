const CommandsPool = require("./commands-pool")

module.exports = class ApiMakerServices {
  static current() {
    if (!window.currentApiMakerService) {
      window.currentApiMakerService = new ApiMakerServices()
    }

    return window.currentApiMakerService
  }

  async sendRequest(serviceName, args) {
    return await CommandsPool.addCommand({
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
