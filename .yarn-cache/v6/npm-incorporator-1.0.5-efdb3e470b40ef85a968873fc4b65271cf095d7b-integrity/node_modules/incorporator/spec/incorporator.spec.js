import Incorporator, {incorporate} from "../src/index.js"

describe("Incorporator", () => {
  it("replaces array values if the option is given", () => {
    const object1 = {
      testValues: ["Kasper", "Christina"]
    }
    const object2 = {
      testValues: ["Storm", "Lisa", "Karl"]
    }

    const incorporator = new Incorporator({objects: [object1, object2]})
    const result = incorporator.merge()

    expect(result).toEqual({testValues: ["Kasper", "Christina", "Storm", "Lisa", "Karl"]})
  })

  it("replaces array values if the option is given", () => {
    const object1 = {
      testValues: ["Kasper", "Christina"]
    }
    const object2 = {
      testValues: ["Storm", "Lisa", "Karl"]
    }

    const incorporator = new Incorporator({objects: [object1, object2]})

    incorporator.replaceArrayIfExists(true)

    const result = incorporator.merge()

    expect(result).toEqual({testValues: ["Storm", "Lisa", "Karl"]})
  })

  it("merges an empty object and changes nothing", () => {
    const object = {
      firstName: "Kasper",
      age: 35
    }

    incorporate(object, {})

    expect(object).toEqual({
      firstName: "Kasper",
      age: 35
    })
  })

  it("merges an empty object into a nested object", () => {
    const object = {ransack: {account_id_eq: 1}}

    incorporate(object, {})

    expect(object).toEqual({ransack: {account_id_eq: 1}})
  })

  it("doesnt corrupt other objects in the given objects to merge", () => {
    const file = new File(["asd"], "file.jpeg")

    const object1 = {
      people: {
        Kasper: {
          lastName: "Nielsen",
          objects: [1]
        }
      }
    }

    const object2 = {
      people: {
        Kasper: {
          lastName: "Johansen",
          objects: [2],
          file
        }
      }
    }

    const object3 = {
      people: {
        Kasper: {
          lastName: "Stoeckel",
          objects: [3]
        }
      }
    }

    const object = {}

    incorporate(object, object1, object2, object3)

    expect(object).toEqual({
      people: {
        Kasper: {
          lastName: "Stoeckel",
          objects: [1, 2, 3],
          file
        }
      }
    })

    expect(object1).toEqual({
      people: {
        Kasper: {
          lastName: "Nielsen",
          objects: [1]
        }
      }
    })

    expect(object2).toEqual({
      people: {
        Kasper: {
          lastName: "Johansen",
          objects: [2],
          file
        }
      }
    })

    expect(object3).toEqual({
      people: {
        Kasper: {
          lastName: "Stoeckel",
          objects: [3]
        }
      }
    })
  })
})
