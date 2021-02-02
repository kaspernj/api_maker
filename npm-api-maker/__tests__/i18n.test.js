const I18n = require("../src/i18n")
const I18nInstance = new I18n()

I18nInstance.scanObject({
  da: {
    hello_world: "Hej verden"
  },
  en: {
    hello_world: "Hello world"
  }
})
I18nInstance.setLocale("da")

describe("I18n", () => {
  test("it translates from the loaded files", () => {
    const helloWorld = I18nInstance.t("hello_world")

    expect(helloWorld).toEqual("Hej verden")
  })

  test("it raises an error when the translation couldnt be found", () => {
    expect(() => { I18nInstance.t("non_existent_key") }).toThrowError("Path didn't exist: da.non_existent_key")
  })
})
