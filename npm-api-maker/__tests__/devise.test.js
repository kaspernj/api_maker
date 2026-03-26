import ApiMakerDevise from "../src/devise.js"
import CableConnectionPool from "../src/cable-connection-pool.js"
import Services from "../src/services.js"
import SessionStatusUpdater from "../src/session-status-updater.js"
import WebsocketRequestClient from "../src/websocket-request-client.js"
import {jest} from "@jest/globals"

describe("ApiMakerDevise", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("can skip the initial sign in event until the caller has refreshed session data", async() => {
    const applyResult = jest.fn()
    const updateSessionStatus = jest.fn().mockResolvedValue(undefined)
    const sendRequest = jest.spyOn(Services.current(), "sendRequest").mockResolvedValue({model: null})
    jest.spyOn(SessionStatusUpdater, "current").mockReturnValue({applyResult, updateSessionStatus})
    const emit = jest.spyOn(ApiMakerDevise.events(), "emit").mockImplementation(() => {})

    await ApiMakerDevise.signIn("teacher@example.com", "secret", {skipSignInEvent: true})

    expect(sendRequest).toHaveBeenCalledWith(
      "Devise::SignIn",
      {
        args: {scope: "user", skipSignInEvent: true},
        password: "secret",
        username: "teacher@example.com"
      },
      {forceHttp: true}
    )
    expect(updateSessionStatus).toHaveBeenCalledTimes(1)
    expect(applyResult).not.toHaveBeenCalled()
    expect(emit).not.toHaveBeenCalledWith("onDeviseSignIn", expect.anything())
  })

  it("forces sign-in over HTTP and does not call persistSession", async() => {
    const sendRequest = jest.spyOn(Services.current(), "sendRequest")
      .mockResolvedValueOnce({
        model: null,
        session_status: {csrf_token: "token-1", scopes: {user: {signed_in: true}}}
      })
    const applyResult = jest.fn()
    const updateSessionStatus = jest.fn().mockResolvedValue(undefined)
    const resetWebsocketRequestClient = jest.spyOn(WebsocketRequestClient, "resetCurrent").mockImplementation(() => {})
    const resetCableConnectionPool = jest.spyOn(CableConnectionPool, "resetCurrent").mockImplementation(() => {})

    jest.spyOn(SessionStatusUpdater, "current").mockReturnValue({applyResult, updateSessionStatus})

    await ApiMakerDevise.signIn("teacher@example.com", "secret")

    expect(sendRequest).toHaveBeenCalledWith(
      "Devise::SignIn",
      {
        args: {scope: "user"},
        password: "secret",
        username: "teacher@example.com"
      },
      {forceHttp: true}
    )
    expect(applyResult).toHaveBeenCalledWith({csrf_token: "token-1", scopes: {user: {signed_in: true}}})
    expect(updateSessionStatus).not.toHaveBeenCalled()
    expect(resetWebsocketRequestClient).toHaveBeenCalledTimes(1)
    expect(resetCableConnectionPool).toHaveBeenCalledTimes(1)
  })

  it("forces sign-out over HTTP and does not call persistSession", async() => {
    const sendRequest = jest.spyOn(Services.current(), "sendRequest")
      .mockResolvedValueOnce({
        session_status: {csrf_token: "token-1", scopes: {user: {signed_in: false}}}
      })
    const applyResult = jest.fn()
    const updateSessionStatus = jest.fn().mockResolvedValue(undefined)
    const resetWebsocketRequestClient = jest.spyOn(WebsocketRequestClient, "resetCurrent").mockImplementation(() => {})
    const resetCableConnectionPool = jest.spyOn(CableConnectionPool, "resetCurrent").mockImplementation(() => {})

    jest.spyOn(SessionStatusUpdater, "current").mockReturnValue({applyResult, updateSessionStatus})

    await ApiMakerDevise.signOut()

    expect(sendRequest).toHaveBeenCalledWith(
      "Devise::SignOut",
      {
        args: {scope: "user"}
      },
      {forceHttp: true}
    )
    expect(applyResult).toHaveBeenCalledWith({csrf_token: "token-1", scopes: {user: {signed_in: false}}})
    expect(updateSessionStatus).not.toHaveBeenCalled()
    expect(resetWebsocketRequestClient).toHaveBeenCalledTimes(1)
    expect(resetCableConnectionPool).toHaveBeenCalledTimes(1)
  })
})
