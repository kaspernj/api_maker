import ApiMakerDevise from "../src/devise.js"
import Services from "../src/services.js"
import {jest} from "@jest/globals"

describe("ApiMakerDevise", () => {
  afterEach(() => {
    jest.restoreAllMocks()
    delete globalThis.ApiMakerDevise.apiMakerSessionStatusUpdater
  })

  it("can skip the initial sign in event until the caller has refreshed session data", async() => {
    const sendRequest = jest.spyOn(Services.current(), "sendRequest").mockResolvedValue({model: null})
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
    expect(emit).not.toHaveBeenCalledWith("onDeviseSignIn", expect.anything())
  })

  it("keeps sign in requests on the shared websocket transport", async() => {
    const sendRequest = jest.spyOn(Services.current(), "sendRequest").mockResolvedValue({
      model: null,
      session_status: {csrf_token: "token-1", scopes: {user: {signed_in: true}}}
    })
    const updateSessionStatus = jest.fn().mockResolvedValue(undefined)
    const applyResult = jest.fn()

    globalThis.ApiMakerDevise.apiMakerSessionStatusUpdater = {applyResult, updateSessionStatus}

    await ApiMakerDevise.signIn("teacher@example.com", "secret")

    expect(sendRequest).toHaveBeenCalledWith(
      "Devise::SignIn",
      {
        args: {scope: "user"},
        password: "secret",
        username: "teacher@example.com"
      }
    )
    expect(applyResult).toHaveBeenCalledWith({csrf_token: "token-1", scopes: {user: {signed_in: true}}})
    expect(updateSessionStatus).not.toHaveBeenCalled()
  })

  it("keeps sign out requests on the shared websocket transport", async() => {
    const sendRequest = jest.spyOn(Services.current(), "sendRequest").mockResolvedValue({
      session_status: {csrf_token: "token-2", scopes: {user: {signed_in: false}}},
      success: true
    })
    const updateSessionStatus = jest.fn().mockResolvedValue(undefined)
    const applyResult = jest.fn()

    globalThis.ApiMakerDevise.apiMakerSessionStatusUpdater = {applyResult, updateSessionStatus}

    await ApiMakerDevise.signOut()

    expect(sendRequest).toHaveBeenCalledWith(
      "Devise::SignOut",
      {
        args: {scope: "user"}
      }
    )
    expect(applyResult).toHaveBeenCalledWith({csrf_token: "token-2", scopes: {user: {signed_in: false}}})
    expect(updateSessionStatus).not.toHaveBeenCalled()
  })
})
