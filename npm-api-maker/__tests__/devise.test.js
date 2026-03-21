import ApiMakerDevise from "../src/devise.js"
import Services from "../src/services.js"
import SessionStatusUpdater from "../src/session-status-updater.js"
import config from "../src/config.js"
import {jest} from "@jest/globals"

describe("ApiMakerDevise", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("can skip the initial sign in event until the caller has refreshed session data", async() => {
    const applyResult = jest.fn()
    const updateMetaElementsFromResult = jest.fn()
    const updateSessionStatus = jest.fn().mockResolvedValue(undefined)
    const sendRequest = jest.spyOn(Services.current(), "sendRequest").mockResolvedValue({model: null})
    jest.spyOn(SessionStatusUpdater, "current").mockReturnValue({applyResult, updateMetaElementsFromResult, updateSessionStatus})
    const emit = jest.spyOn(ApiMakerDevise.events(), "emit").mockImplementation(() => {})

    await ApiMakerDevise.signIn("teacher@example.com", "secret", {skipSignInEvent: true})

    expect(sendRequest).toHaveBeenCalledWith(
      "Devise::SignIn",
      {
        args: {scope: "user", skipSignInEvent: true},
        password: "secret",
        username: "teacher@example.com"
      }
    )
    expect(updateSessionStatus).toHaveBeenCalledTimes(1)
    expect(applyResult).not.toHaveBeenCalled()
    expect(updateMetaElementsFromResult).not.toHaveBeenCalled()
    expect(emit).not.toHaveBeenCalledWith("onDeviseSignIn", expect.anything())
  })

  it("keeps sign in requests on the shared websocket transport", async() => {
    const sendRequest = jest.spyOn(Services.current(), "sendRequest")
      .mockResolvedValueOnce({
        model: null,
        session_status: {csrf_token: "token-1", scopes: {user: {signed_in: true}}, shadow_session_token: "shadow-token"}
      })
      .mockResolvedValueOnce({
        session_status: {csrf_token: "token-2", scopes: {user: {signed_in: true}}},
        success: true
    })
    const applyResult = jest.fn()
    const updateMetaElementsFromResult = jest.fn()
    const updateSessionStatus = jest.fn().mockResolvedValue(undefined)

    jest.spyOn(config, "getWebsocketRequests").mockReturnValue(true)
    jest.spyOn(SessionStatusUpdater, "current").mockReturnValue({applyResult, updateMetaElementsFromResult, updateSessionStatus})

    await ApiMakerDevise.signIn("teacher@example.com", "secret")

    expect(sendRequest).toHaveBeenNthCalledWith(
      1,
      "Devise::SignIn",
      {
        args: {scope: "user"},
        password: "secret",
        username: "teacher@example.com"
      }
    )
    expect(sendRequest).toHaveBeenNthCalledWith(
      2,
      "Devise::PersistSession",
      {rememberMe: undefined, scope: "user", shadowSessionToken: "shadow-token", signedIn: true},
      {forceHttp: true}
    )
    expect(updateMetaElementsFromResult).toHaveBeenCalledWith({csrf_token: "token-1", scopes: {user: {signed_in: true}}, shadow_session_token: "shadow-token"})
    expect(applyResult).toHaveBeenCalledWith({csrf_token: "token-2", scopes: {user: {signed_in: true}}})
    expect(updateSessionStatus).not.toHaveBeenCalled()
  })

  it("keeps sign out requests on the shared websocket transport", async() => {
    const sendRequest = jest.spyOn(Services.current(), "sendRequest")
      .mockResolvedValueOnce({
        session_status: {csrf_token: "token-2", scopes: {user: {signed_in: false}}},
        success: true
      })
      .mockResolvedValueOnce({
        session_status: {csrf_token: "token-3", scopes: {user: {signed_in: false}}},
        success: true
    })
    const applyResult = jest.fn()
    const updateMetaElementsFromResult = jest.fn()
    const updateSessionStatus = jest.fn().mockResolvedValue(undefined)

    jest.spyOn(config, "getWebsocketRequests").mockReturnValue(true)
    jest.spyOn(SessionStatusUpdater, "current").mockReturnValue({applyResult, updateMetaElementsFromResult, updateSessionStatus})

    await ApiMakerDevise.signOut()

    expect(sendRequest).toHaveBeenNthCalledWith(
      1,
      "Devise::SignOut",
      {
        args: {scope: "user"}
      }
    )
    expect(sendRequest).toHaveBeenNthCalledWith(
      2,
      "Devise::PersistSession",
      {scope: "user", signedIn: false},
      {forceHttp: true}
    )
    expect(updateMetaElementsFromResult).toHaveBeenCalledWith({csrf_token: "token-2", scopes: {user: {signed_in: false}}})
    expect(applyResult).toHaveBeenCalledWith({csrf_token: "token-3", scopes: {user: {signed_in: false}}})
    expect(updateSessionStatus).not.toHaveBeenCalled()
  })
})
