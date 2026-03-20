import ApiMakerCommandsPool from "../src/commands-pool.js"
import Config from "../src/config.js"
import WebsocketRequestClient from "../src/websocket-request-client.js"
import {jest} from "@jest/globals"

describe("ApiMakerCommandsPool", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("uses websocket requests whenever they are enabled and no files are present", async() => {
    const pool = new ApiMakerCommandsPool()
    const perform = jest.spyOn(WebsocketRequestClient.current(), "perform").mockResolvedValue({via: "websocket"})

    pool.requestOptions = {forceHttp: true}
    jest.spyOn(Config, "getWebsocketRequests").mockReturnValue(true)

    const response = await pool.sendRequest({
      commandSubmitData: {
        getFilesCount: () => 0,
        getFormData: () => new FormData(),
        getJsonData: () => ({pool: {}})
      },
      url: "/api_maker/commands"
    })

    expect(perform).toHaveBeenCalledWith({
      cacheResponse: undefined,
      global: {},
      request: {pool: {}}
    })
    expect(response).toEqual({via: "websocket"})
  })
})
