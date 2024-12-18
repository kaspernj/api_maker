import {digg} from "diggerize"
import * as inflection from "inflection"

export default class ApiMakerInputsAutoSubmit {
  constructor ({component}) {
    this.component = component
  }

  autoSubmit () {
    const {attribute, model} = this.component.props
    const updateAttributeName = inflection.underscore(attribute)
    const updateParams = {}

    updateParams[updateAttributeName] = this.value()

    model.update(updateParams)
  }

  value () {
    const inputRef = this.component.props.inputRef || this.component.props.inputProps?.ref || this.component.inputProps?.ref || this.component.inputRef
    const input = digg(inputRef, "current")

    if (input.type == "checkbox") {
      if (input.checked) {
        if (input.value !== undefined) {
          return input.value
        } else {
          return 1
        }
      } else {
        return 0
      }
    }

    return digg(input, "value")
  }
}
