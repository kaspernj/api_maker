// @ts-check
import Api from "../src/api.js"
import CustomError from "../src/custom-error.js"
import SessionStatusUpdater from "../src/session-status-updater.js"
import {jest} from "@jest/globals"

/**
 * @param {object} args
 * @param {string} args.contentType
 * @param {string} args.responseText
 * @param {number} args.status
 * @returns {XMLHttpRequest}
 */
const fakeXhr = ({contentType, responseText, status}) => /** @type {XMLHttpRequest} */ ({
  getResponseHeader: () => contentType,
  responseText,
  send() { this.onload() },
  status
})

describe("Api", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe("executeXhr", () => {
    it("rejects with a descriptive CustomError when the content-type is JSON but the body is not valid JSON", async() => {
      const xhr = fakeXhr({
        contentType: "application/json",
        responseText: "<!DOCTYPE html><html><body>Sign in</body></html>",
        status: 200
      })

      const error = await Api.executeXhr(xhr, undefined).catch((e) => e)

      expect(error).toBeInstanceOf(CustomError)
      expect(error.message).toContain("Invalid JSON in response body")
      expect(error.message).toContain("<!DOCTYPE html>")
    })

    it("resolves with the raw body for a non-JSON content-type so error pages stay inspectable", async() => {
      const xhr = fakeXhr({
        contentType: "text/html",
        responseText: "<!DOCTYPE html>",
        status: 200
      })

      expect(await Api.executeXhr(xhr, undefined)).toBe("<!DOCTYPE html>")
    })

    it("rejects failed statuses with the parsed body as before", async() => {
      const xhr = fakeXhr({
        contentType: "application/json",
        responseText: "{\"error\": \"nope\"}",
        status: 500
      })

      const error = await Api.executeXhr(xhr, undefined).catch((e) => e)

      expect(error).toBeInstanceOf(CustomError)
      expect(error.message).toContain("Request failed with code: 500")
    })
  })

  describe("requestLocal", () => {
    it("rejects when a successful request returns a non-JSON body instead of resolving a string", async() => {
      jest.spyOn(SessionStatusUpdater.current(), "getCsrfToken").mockResolvedValue("token")
      jest.spyOn(Api, "request").mockResolvedValue("<!DOCTYPE html><html><body>Sign in</body></html>")

      const error = await Api.requestLocal({data: {pool: {}}, method: "POST", path: "/api_maker/commands"}).catch((e) => e)

      expect(error).toBeInstanceOf(CustomError)
      expect(error.message).toContain("Expected JSON response from /api_maker/commands")
      expect(error.message).toContain("<!DOCTYPE html>")
    })

    it("resolves JSON object responses as before", async() => {
      jest.spyOn(SessionStatusUpdater.current(), "getCsrfToken").mockResolvedValue("token")
      jest.spyOn(Api, "request").mockResolvedValue({responses: {}})

      expect(await Api.requestLocal({data: {pool: {}}, method: "POST", path: "/api_maker/commands"})).toEqual({responses: {}})
    })
  })
})
