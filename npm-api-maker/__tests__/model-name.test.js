const I18nOnSteroids = require("i18n-on-steroids")
const i18n = new I18nOnSteroids()
const ModelName = require("../src/model-name.cjs")

i18n.scanObject({
  da: {
    activerecord: {
      models: {
        user: {
          one: "Bruger",
          other: "Brugere"
        }
      }
    }
  }
})
i18n.setLocale("da")

describe("ModelName", () => {
  test("human", () => {
    const modelClassData = {i18nKey: "user"}
    const modelName = new ModelName({i18n, modelClassData})

    expect(modelName.human()).toEqual("Bruger")
    expect(modelName.human({count: 2})).toEqual("Brugere")
  })
})
