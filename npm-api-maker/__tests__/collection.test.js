const Collection = require("../src/collection.cjs")

describe("Collection", () => {
  describe("ransack", () => {
    it("handles sorts of different types", () => {
      let collection = new Collection({}, {})

      collection = collection.ransack({s: "created_at"})
      expect(collection.queryArgs.ransack.s).toEqual("created_at")

      collection = collection.ransack({s: ["id", "name"]})
      expect(collection.queryArgs.ransack.s).toEqual(["created_at", "id", "name"])
    })
  })

  describe("selectColumns", () => {
    it("adds selected columns to the query", () => {
      let collection = new Collection({}, {})

      collection = collection.selectColumns({User: ["id"]})
      expect(collection.queryArgs.selectColumns).toEqual({user: ["id"]})

      collection = collection.selectColumns({User: ["email"]})
      expect(collection.queryArgs.selectColumns).toEqual({user: ["id", "email"]})
    })
  })
})
