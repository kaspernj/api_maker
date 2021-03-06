const Params = require("../src/params.cjs")

describe("Params", () => {
  describe("change", () => {
    it("changes the params", () => {
      delete window.location

      window.location = {
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
      delete window.location

      window.location = {
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
