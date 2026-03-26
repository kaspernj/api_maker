import ApiMakerDevise from "../src/devise.js"
import CableConnectionPool from "../src/cable-connection-pool.js"
import Services from "../src/services.js"
import SessionStatusUpdater from "../src/session-status-updater.js"
import {jest} from "@jest/globals"

describe("ApiMakerDevise", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("can skip the initial sign in event until the caller has refreshed session data", async() => {
    const applyResult = jest.fn()
    const updateSessionStatus = jest.fn().mockResolvedValue(undefined)
    const sessionStatus = jest.fn().mockResolvedValue({
      csrf_token: "token-0",
      scopes: {user: {signed_in: true}},
      shadow_session_token: "shadow-token-0"
    })
    const refreshAuthentication = jest.fn().mockResolvedValue(undefined)
    const sendRequest = jest.spyOn(Services.current(), "sendRequest")
      .mockResolvedValueOnce({model: null})
      .mockResolvedValueOnce({success: true})
    jest.spyOn(SessionStatusUpdater, "current").mockReturnValue({applyResult, sessionStatus, updateSessionStatus})
    jest.spyOn(CableConnectionPool, "current").mockReturnValue({refreshAuthentication})
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
    expect(sessionStatus).toHaveBeenCalledTimes(1)
    expect(applyResult).toHaveBeenCalledWith({
      csrf_token: "token-0",
      scopes: {user: {signed_in: true}},
      shadow_session_token: "shadow-token-0"
    })
    expect(refreshAuthentication).toHaveBeenCalledWith({
      rememberMe: undefined,
      scope: "user",
      shadowSessionToken: "shadow-token-0",
      signedIn: true
    })
    expect(emit).not.toHaveBeenCalledWith("onDeviseSignIn", expect.anything())
  })

  it("signs in over HTTP and refreshes websocket auth in place", async() => {
    const sendRequest = jest.spyOn(Services.current(), "sendRequest")
      .mockResolvedValueOnce({
        model: null,
        session_status: {
          csrf_token: "token-1",
          scopes: {user: {signed_in: true}},
          shadow_session_token: "shadow-token-1"
        }
      })
      .mockResolvedValueOnce({success: true})
    const applyResult = jest.fn()
    const refreshAuthentication = jest.fn().mockResolvedValue(undefined)

    jest.spyOn(SessionStatusUpdater, "current").mockReturnValue({applyResult})
    jest.spyOn(CableConnectionPool, "current").mockReturnValue({refreshAuthentication})

    await ApiMakerDevise.signIn("teacher@example.com", "secret")

    expect(sendRequest).toHaveBeenNthCalledWith(
      1,
      "Devise::SignIn",
      {
        args: {scope: "user"},
        password: "secret",
        username: "teacher@example.com"
      },
      {forceHttp: true}
    )
    expect(sendRequest).toHaveBeenNthCalledWith(
      2,
      "Devise::PersistSession",
      {
        rememberMe: undefined,
        scope: "user",
        shadowSessionToken: "shadow-token-1",
        signedIn: true
      }
    )
    expect(applyResult).toHaveBeenCalledWith({
      csrf_token: "token-1",
      scopes: {user: {signed_in: true}},
      shadow_session_token: "shadow-token-1"
    })
    expect(refreshAuthentication).toHaveBeenCalledWith({
      rememberMe: undefined,
      scope: "user",
      shadowSessionToken: "shadow-token-1",
      signedIn: true
    })
  })

  it("signs out over HTTP and refreshes websocket auth in place", async() => {
    const sendRequest = jest.spyOn(Services.current(), "sendRequest")
      .mockResolvedValueOnce({
        session_status: {
          csrf_token: "token-1",
          scopes: {user: {signed_in: false}},
          shadow_session_token: "shadow-token-2"
        }
      })
      .mockResolvedValueOnce({success: true})
    const applyResult = jest.fn()
    const refreshAuthentication = jest.fn().mockResolvedValue(undefined)

    jest.spyOn(SessionStatusUpdater, "current").mockReturnValue({applyResult})
    jest.spyOn(CableConnectionPool, "current").mockReturnValue({refreshAuthentication})

    await ApiMakerDevise.signOut()

    expect(sendRequest).toHaveBeenNthCalledWith(
      1,
      "Devise::SignOut",
      {
        args: {scope: "user"}
      },
      {forceHttp: true}
    )
    expect(sendRequest).toHaveBeenNthCalledWith(
      2,
      "Devise::PersistSession",
      {
        scope: "user",
        shadowSessionToken: "shadow-token-2",
        signedIn: false
      }
    )
    expect(applyResult).toHaveBeenCalledWith({
      csrf_token: "token-1",
      scopes: {user: {signed_in: false}},
      shadow_session_token: "shadow-token-2"
    })
    expect(refreshAuthentication).toHaveBeenCalledWith({
      scope: "user",
      shadowSessionToken: "shadow-token-2",
      signedIn: false
    })
  })

  it("loads session status over HTTP before refreshing websocket auth when sign-in does not return it inline", async() => {
    const sendRequest = jest.spyOn(Services.current(), "sendRequest")
      .mockResolvedValueOnce({model: null})
      .mockResolvedValueOnce({success: true})
    const applyResult = jest.fn()
    const sessionStatus = jest.fn().mockResolvedValue({
      csrf_token: "token-2",
      scopes: {user: {signed_in: true}},
      shadow_session_token: "shadow-token-3"
    })
    const refreshAuthentication = jest.fn().mockResolvedValue(undefined)

    jest.spyOn(SessionStatusUpdater, "current").mockReturnValue({applyResult, sessionStatus})
    jest.spyOn(CableConnectionPool, "current").mockReturnValue({refreshAuthentication})

    await ApiMakerDevise.signIn("teacher@example.com", "secret")

    expect(sessionStatus).toHaveBeenCalledTimes(1)
    expect(sendRequest).toHaveBeenNthCalledWith(
      2,
      "Devise::PersistSession",
      {
        rememberMe: undefined,
        scope: "user",
        shadowSessionToken: "shadow-token-3",
        signedIn: true
      }
    )
    expect(applyResult).toHaveBeenCalledWith({
      csrf_token: "token-2",
      scopes: {user: {signed_in: true}},
      shadow_session_token: "shadow-token-3"
    })
    expect(refreshAuthentication).toHaveBeenCalledWith({
      rememberMe: undefined,
      scope: "user",
      shadowSessionToken: "shadow-token-3",
      signedIn: true
    })
  })
})
