const Collection = require("../src/collection.cjs")

describe("Collection", () => {
  describe("selectColumns", () => {
    fit("adds selected columns to the query", () => {
      let collection = new Collection({}, {})

      collection = collection.selectColumns({User: ["id"]})

      expect(collection.queryArgs.selectColumns).toEqual({user: ["id"]})

      collection = collection.selectColumns({User: ["email"]})

      expect(collection.queryArgs.selectColumns).toEqual({user: ["id", "email"]})
    })
  })
})
