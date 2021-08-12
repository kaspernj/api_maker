const CommandsPool = require("./commands-pool.cjs")

module.exports = class ApiMakerServices {
  static current() {
    if (!global.currentApiMakerService) {
      global.currentApiMakerService = new ApiMakerServices()
    }

    return global.currentApiMakerService
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
