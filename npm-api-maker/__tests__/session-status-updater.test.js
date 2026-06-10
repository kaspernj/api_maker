// @ts-check
import ApiMakerSessionStatusUpdater from "../src/session-status-updater.js"
import {jest} from "@jest/globals"

describe("ApiMakerSessionStatusUpdater", () => {
  afterEach(() => {
    jest.restoreAllMocks()
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
})
