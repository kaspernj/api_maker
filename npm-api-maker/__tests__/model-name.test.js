import I18nOnSteroids from "i18n-on-steroids"
import ModelName from "../build/model-name"

const i18n = new I18nOnSteroids()

const initializeI18n = () => {
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
}

describe("ModelName", () => {
  beforeEach(() => {
    initializeI18n()
  })

  test("human", () => {
    const modelClassData = {i18nKey: "user"}
    const modelName = new ModelName({i18n, modelClassData})

    expect(modelName.human()).toEqual("Bruger")
    expect(modelName.human({count: 2})).toEqual("Brugere")
  })
})
