const FormData = require("./support/fake-form-data.cjs")
const FormDataObjectizer = require("../index.cjs")

describe("form-data-objectizer", () => {
  it("converts nested keys", () => {
    const formData = new FormData()

    formData.append("model_search[global]", "0")
    formData.append("model_search[model_search_group_attributes][group_mode]", "and")
    formData.append("model_search[model_search_group_attributes][model_search_rules_attributes][700865670245722100][rule_attribute]", "id")

    const object = FormDataObjectizer.toObject(formData)

    expect(object).toEqual({
      model_search: {
        global: "0",
        model_search_group_attributes: {
          group_mode: "and",
          model_search_rules_attributes: {
            700865670245722100: {
              rule_attribute: "id"
            }
          }
        }
      }
    })
  })
})
