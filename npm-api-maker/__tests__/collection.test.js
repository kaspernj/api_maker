import Collection from "../build/collection"

describe("Collection", () => {
  describe("count", () => {
    it("is able to clone the collection and merge count into it without manipulating the original given query", () => {
      let collection = new Collection({}, {})

      collection.ransack({name_cont: "Kasper"})

      let countCollection = collection.clone()._merge({count: true})

      expect(collection.queryArgs).toEqual({ransack: {name_cont: "Kasper"}})
      expect(countCollection.queryArgs).toEqual({count: true, ransack: {name_cont: "Kasper"}})
    })
  })

  describe("ransack", () => {
    it("handles undefined arguments", () => {
      // This can happen if someone does something like this and users_q isn't set:
      // query.ransack(params.users_q)

      let collection = new Collection({}, {ransack: {id_eq: 5}})

      collection.ransack(undefined)

      expect(collection.queryArgs).toEqual({ransack: {id_eq: 5}})
    })

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
