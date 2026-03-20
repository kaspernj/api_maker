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
    const sendRequest = jest.spyOn(Services.current(), "sendRequest").mockResolvedValue({model: null})
    const updateSessionStatus = jest.fn().mockResolvedValue(undefined)

    globalThis.ApiMakerDevise.apiMakerSessionStatusUpdater = {updateSessionStatus}

    await ApiMakerDevise.signIn("teacher@example.com", "secret")

    expect(sendRequest).toHaveBeenCalledWith(
      "Devise::SignIn",
      {
        args: {scope: "user"},
        password: "secret",
        username: "teacher@example.com"
      }
    )
    expect(updateSessionStatus).toHaveBeenCalledTimes(1)
  })

  it("keeps sign out requests on the shared websocket transport", async() => {
    const sendRequest = jest.spyOn(Services.current(), "sendRequest").mockResolvedValue({})
    const updateSessionStatus = jest.fn().mockResolvedValue(undefined)

    globalThis.ApiMakerDevise.apiMakerSessionStatusUpdater = {updateSessionStatus}

    await ApiMakerDevise.signOut()

    expect(sendRequest).toHaveBeenCalledWith(
      "Devise::SignOut",
      {
        args: {scope: "user"}
      }
    )
    expect(updateSessionStatus).toHaveBeenCalledTimes(1)
  })
})
