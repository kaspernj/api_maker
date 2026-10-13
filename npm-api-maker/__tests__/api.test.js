// @ts-check
import Api from "../src/api.js"

describe("Api", () => {
  describe("_parseResponse", () => {
    it("returns the raw body when a JSON content-type body is not valid JSON instead of throwing", () => {
      const xhr = {
        getResponseHeader: () => "application/json",
        responseText: "<!DOCTYPE html><html><body>Sign in</body></html>"
      }

      expect(Api._parseResponse(xhr)).toBe("<!DOCTYPE html><html><body>Sign in</body></html>")
    })

    it("parses valid JSON bodies as before", () => {
      const xhr = {
        getResponseHeader: () => "application/json",
        responseText: "{\"responses\": {\"1\": {\"type\": \"success\", \"data\": {}}}}"
      }

      expect(Api._parseResponse(xhr)).toEqual({responses: {"1": {type: "success", data: {}}}})
    })
  })
})
