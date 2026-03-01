import * as inflection from "inflection"
import {digg} from "diggerize"

/** Auto-submit helper for input components. */
export default class ApiMakerInputsAutoSubmit {
  /** @param {{component: {props: Record<string, any>, inputProps?: Record<string, any>, inputRef?: any}}} args */
  constructor ({component}) {
    this.component = component
  }

  /** @returns {void} */
  autoSubmit () {
    const {attribute, model} = this.component.props
    const updateAttributeName = inflection.underscore(attribute)
    const updateParams = {}

    updateParams[updateAttributeName] = this.value()

    model.update(updateParams)
  }

  /** @returns {any} */
  value () {
    const inputRef = this.component.props.inputRef || this.component.props.inputProps?.ref || this.component.inputProps?.ref || this.component.inputRef
    const input = digg(inputRef, "current")

    if (input.type == "checkbox") {
      if (input.checked) {
        if (input.value === undefined) {
          return 1
        }

        return input.value
      } else {
        return 0
      }
    }

    return digg(input, "value")
  }
}
