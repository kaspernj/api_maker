import Params from "../build/params.js"

describe("Params", () => {
  describe("change", () => {
    it("changes the params", () => {
      delete global.location

      global.location = {
        search: "?q[name_cont]=kasper"
      }

      const result = Params.change({q: {s: "name asc"}})

      expect(result).toEqual({
        q: {
          name_cont: "kasper",
          s: "name asc"
        }
      })
    })
  })

  describe("parse", () => {
    it("parses the current path", () => {
      delete global.location

      global.location = {
        search: "?q[name_cont]=kasper"
      }

      const result = Params.parse()

      expect(result).toEqual({
        q: {
          name_cont: "kasper"
        }
      })
    })
  })
})
