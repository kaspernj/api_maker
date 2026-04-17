import ApiMakerCommandsPool from "../src/commands-pool.js"
import Config from "../src/config.js"
import Devise from "../src/devise.js"
import SessionStatusUpdater from "../src/session-status-updater.js"
import WebsocketRequestClient from "../src/websocket-request-client.js"
import {jest} from "@jest/globals"

describe("ApiMakerCommandsPool", () => {
  afterEach(() => {
    jest.restoreAllMocks()
    delete globalThis.apiMakerDeviseCurrent
    globalThis.ApiMakerDevise = {scopes: {}}
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

    Devise.addUserScope("user")
    globalThis.apiMakerDeviseCurrent = {user: {id: "user-1"}}

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

  it("does not refresh session status when no registered scope is signed in", async() => {
    const pool = new ApiMakerCommandsPool()
    const commandExecution = {
      reject: jest.fn(),
      resolve: jest.fn()
    }
    const refreshSessionStatus = jest.spyOn(SessionStatusUpdater.current(), "updateSessionStatus").mockResolvedValue(undefined)

    Devise.addUserScope("user")

    await pool.handleFailedResponse(
      {commandExecution},
      {
        error_type: "not_found_or_no_access",
        errors: [{message: "no access", type: "not_found_or_no_access"}]
      }
    )

    expect(refreshSessionStatus).not.toHaveBeenCalled()
    expect(commandExecution.reject).toHaveBeenCalledTimes(1)
  })

  describe("rejectWithCallerStack", () => {
    it("appends V8-style caller frames (stripping the 'Error' header) to the rejection error", () => {
      const pool = new ApiMakerCommandsPool()
      const commandExecution = {reject: jest.fn()}
      const error = new Error("boom")

      error.stack = "Error: boom\n    at flush (commands-pool.js:1:1)"

      const callerStack = "Error\n    at callerFrame (some-file.js:1:1)\n    at outerFrame (other-file.js:2:2)"

      pool.rejectWithCallerStack({commandExecution, stack: callerStack}, error)

      expect(commandExecution.reject).toHaveBeenCalledTimes(1)
      const rejected = commandExecution.reject.mock.calls[0][0]

      expect(rejected).toBe(error)
      expect(rejected.stack).toContain("at flush (commands-pool.js:1:1)")
      expect(rejected.stack).toContain("at callerFrame (some-file.js:1:1)")
      expect(rejected.stack).toContain("at outerFrame (other-file.js:2:2)")
    })

    it("keeps non-V8 caller frames intact (no 'Error' header to strip)", () => {
      const pool = new ApiMakerCommandsPool()
      const commandExecution = {reject: jest.fn()}
      const error = new Error("boom")

      error.stack = "flushInternal@commands-pool.js:1:1"

      const callerStack = "callerFrame@some-file.js:10:5\nouterFrame@other-file.js:2:2"

      pool.rejectWithCallerStack({commandExecution, stack: callerStack}, error)

      const rejected = commandExecution.reject.mock.calls[0][0]

      expect(rejected.stack).toContain("flushInternal@commands-pool.js:1:1")
      expect(rejected.stack).toContain("callerFrame@some-file.js:10:5")
      expect(rejected.stack).toContain("outerFrame@other-file.js:2:2")
    })

    it("rejects without touching the stack when no caller stack was captured", () => {
      const pool = new ApiMakerCommandsPool()
      const commandExecution = {reject: jest.fn()}
      const error = new Error("boom")
      const originalStack = error.stack

      pool.rejectWithCallerStack({commandExecution}, error)

      expect(commandExecution.reject).toHaveBeenCalledWith(error)
      expect(error.stack).toEqual(originalStack)
    })
  })

  describe("handleFailedResponse stack preservation", () => {
    const callerStack = "Error\n    at someCaller (app.js:42:13)"

    it("preserves caller stack on generic command failure", async() => {
      const pool = new ApiMakerCommandsPool()
      const commandExecution = {reject: jest.fn(), resolve: jest.fn()}

      await pool.handleFailedResponse(
        {commandExecution, stack: callerStack},
        {
          error_type: "custom_error",
          errors: [{message: "limit reached"}]
        }
      )

      expect(commandExecution.reject).toHaveBeenCalledTimes(1)
      const rejected = commandExecution.reject.mock.calls[0][0]

      expect(rejected.stack).toContain("at someCaller (app.js:42:13)")
    })

    it("preserves caller stack on destroy_error", async() => {
      const pool = new ApiMakerCommandsPool()
      const commandExecution = {reject: jest.fn(), resolve: jest.fn()}

      await pool.handleFailedResponse(
        {commandExecution, stack: callerStack},
        {
          error_type: "destroy_error",
          errors: [{message: "cannot destroy"}]
        }
      )

      const rejected = commandExecution.reject.mock.calls[0][0]

      expect(rejected.stack).toContain("at someCaller (app.js:42:13)")
    })

    it("preserves caller stack on validation_error", async() => {
      const pool = new ApiMakerCommandsPool()
      const commandExecution = {reject: jest.fn(), resolve: jest.fn()}

      await pool.handleFailedResponse(
        {commandExecution, stack: callerStack},
        {
          error_type: "validation_error",
          model: {id: "1"},
          validation_errors: []
        }
      )

      const rejected = commandExecution.reject.mock.calls[0][0]

      expect(rejected.stack).toContain("at someCaller (app.js:42:13)")
    })
  })
})
