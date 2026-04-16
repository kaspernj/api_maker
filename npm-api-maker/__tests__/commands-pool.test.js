import ApiMakerCommandsPool from "../src/commands-pool.js"
import Config from "../src/config.js"
import Devise from "../src/devise.js"
import SessionStatusUpdater from "../src/session-status-updater.js"
import WebsocketRequestClient from "../src/websocket-request-client.js"
import {jest} from "@jest/globals"

describe("ApiMakerCommandsPool", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("uses websocket requests whenever they are enabled and no files are present", async() => {
    const pool = new ApiMakerCommandsPool()
    const perform = jest.spyOn(WebsocketRequestClient.current(), "perform").mockResolvedValue({via: "websocket"})

    jest.spyOn(Config, "getWebsocketRequests").mockReturnValue(true)

    const response = await pool.sendRequest({
      commandExecution: {
        addLog: jest.fn(),
        setProgress: jest.fn(),
        setReceived: jest.fn()
      },
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
      onLog: expect.any(Function),
      onProgress: expect.any(Function),
      onReceived: expect.any(Function),
      request: {pool: {}}
    })
    expect(response).toEqual({via: "websocket"})
  })

  it("refreshes session status when a failed command reports not_found_or_no_access while signed in", async() => {
    const pool = new ApiMakerCommandsPool()
    const commandExecution = {
      reject: jest.fn(),
      resolve: jest.fn()
    }
    const refreshSessionStatus = jest.spyOn(SessionStatusUpdater.current(), "updateSessionStatus").mockResolvedValue(undefined)

    Devise.current().currents.user = {id: () => "user-1"}

    await pool.handleFailedResponse(
      {commandExecution},
      {
        error_type: "not_found_or_no_access",
        errors: [{message: "no access", type: "not_found_or_no_access"}]
      }
    )

    expect(refreshSessionStatus).toHaveBeenCalledTimes(1)
    expect(commandExecution.reject).toHaveBeenCalledTimes(1)
  })
})
