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
})
