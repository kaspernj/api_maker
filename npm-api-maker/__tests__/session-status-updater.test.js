// @ts-check
import ApiMakerSessionStatusUpdater from "../src/session-status-updater.js"
import Devise from "../src/devise.js"
import {jest} from "@jest/globals"

const setMetaCsrfToken = (value) => {
  let metaElement = document.querySelector("meta[name='csrf-token']")

  if (!metaElement) {
    metaElement = document.createElement("meta")
    metaElement.setAttribute("name", "csrf-token")
    document.head.appendChild(metaElement)
  }

  metaElement.setAttribute("content", value)
}

describe("ApiMakerSessionStatusUpdater", () => {
  afterEach(() => {
    jest.restoreAllMocks()

    document.querySelector("meta[name='csrf-token']")?.remove()
  })

  it("returns undefined when session status does not provide a csrf token", async() => {
    const updater = new ApiMakerSessionStatusUpdater({useMetaElement: false})

    jest.spyOn(updater, "sessionStatus").mockResolvedValue({scopes: {}})

    await expect(updater.getCsrfToken()).resolves.toBeUndefined()
  })

  it("refreshes session status once when the page returns to the foreground from a burst of signals", () => {
    jest.useFakeTimers()

    try {
      Object.defineProperty(document, "visibilityState", {configurable: true, get: () => "visible"})

      const updater = new ApiMakerSessionStatusUpdater({useMetaElement: false})
      const update = jest.spyOn(updater, "updateSessionStatus").mockResolvedValue(undefined)

      // visibilitychange + focus + pageshow can all fire together on return.
      updater.refreshOnReturnToForeground()
      updater.refreshOnReturnToForeground()
      updater.refreshOnReturnToForeground()

      jest.advanceTimersByTime(60)

      expect(update).toHaveBeenCalledTimes(1)
    } finally {
      jest.useRealTimers()
    }
  })

  it("does not refresh session status while the page is hidden", () => {
    jest.useFakeTimers()

    try {
      Object.defineProperty(document, "visibilityState", {configurable: true, get: () => "hidden"})

      const updater = new ApiMakerSessionStatusUpdater({useMetaElement: false})
      const update = jest.spyOn(updater, "updateSessionStatus").mockResolvedValue(undefined)

      updater.refreshOnReturnToForeground()
      jest.advanceTimersByTime(60)

      expect(update).not.toHaveBeenCalled()
    } finally {
      jest.useRealTimers()
    }
  })

  describe("updateSessionStatus rotation guard", () => {
    it("applies the result when the csrf token did not change during the request", async() => {
      const updater = new ApiMakerSessionStatusUpdater({useMetaElement: true})
      const applyResult = jest.spyOn(updater, "applyResult").mockReturnValue(undefined)
      jest.spyOn(updater, "sessionStatus").mockResolvedValue({csrf_token: "fresh", scopes: {}})

      setMetaCsrfToken("stable")

      await updater.updateSessionStatus()

      expect(applyResult).toHaveBeenCalledTimes(1)
    })

    it("skips and logs when the csrf token rotated while the request was in flight", async() => {
      const updater = new ApiMakerSessionStatusUpdater({useMetaElement: true})
      const applyResult = jest.spyOn(updater, "applyResult").mockReturnValue(undefined)
      const warn = jest.spyOn(console, "warn").mockImplementation(() => {})

      // A sign-in rotates the token while sessionStatus() is still in flight.
      jest.spyOn(updater, "sessionStatus").mockImplementation(async() => {
        setMetaCsrfToken("rotated-by-signin")
        return {csrf_token: "stale", scopes: {}}
      })

      setMetaCsrfToken("original")

      await updater.updateSessionStatus()

      expect(applyResult).not.toHaveBeenCalled()
      expect(warn).toHaveBeenCalledTimes(1)
    })

    it("applies the result when there is no meta element (React Native)", async() => {
      const updater = new ApiMakerSessionStatusUpdater({useMetaElement: false})
      const applyResult = jest.spyOn(updater, "applyResult").mockReturnValue(undefined)
      jest.spyOn(updater, "sessionStatus").mockResolvedValue({csrf_token: "fresh", scopes: {}})

      await updater.updateSessionStatus()

      expect(applyResult).toHaveBeenCalledTimes(1)
    })
  })

  describe("session status failure handling", () => {
    it("rejects when the session status response is not 2xx", async() => {
      const xhrInstance = {
        status: 500,
        responseText: "{}",
        open: jest.fn(),
        send: jest.fn(() => xhrInstance.onload())
      }

      jest.spyOn(global, "XMLHttpRequest").mockImplementation(() => xhrInstance)

      const updater = new ApiMakerSessionStatusUpdater({useMetaElement: false})

      await expect(updater.sessionStatus()).rejects.toThrow("Session status request failed with code: 500")
    })

    it("does not apply and logs when the session status request fails", async() => {
      const updater = new ApiMakerSessionStatusUpdater({useMetaElement: true})
      const applyResult = jest.spyOn(updater, "applyResult").mockReturnValue(undefined)
      const warn = jest.spyOn(console, "warn").mockImplementation(() => {})

      jest.spyOn(updater, "sessionStatus").mockRejectedValue(new Error("Session status request failed with code: 500"))

      setMetaCsrfToken("stable")

      await updater.updateSessionStatus()

      expect(applyResult).not.toHaveBeenCalled()
      expect(warn).toHaveBeenCalledTimes(1)
    })

    it("clears the cached csrf token", async() => {
      const updater = new ApiMakerSessionStatusUpdater({useMetaElement: false})
      jest.spyOn(updater, "sessionStatus").mockResolvedValue({csrf_token: "fresh", scopes: {}})

      await updater.updateSessionStatus()
      expect(updater.csrfToken).toBe("fresh")

      updater.clearCsrfToken()
      expect(updater.csrfToken).toBeUndefined()
    })
  })

  describe("csrf token cache on devise sign-in", () => {
    it("clears the cached csrf token when a scope signs in", () => {
      const updater = new ApiMakerSessionStatusUpdater({useMetaElement: false})

      // A pre-sign-in cached token is stale once the session rotates on sign-in.
      updater.csrfToken = "stale"

      Devise.events().emit("onDeviseSignIn", {scope: "user"})

      expect(updater.csrfToken).toBeUndefined()
    })
  })
})
