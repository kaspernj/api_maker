// @ts-check
import * as inflection from "inflection"
import {digg} from "diggerize"

/** @typedef {{checked?: boolean, type?: string, value?: boolean | number | string}} AutoSubmitInputElement */
/** @typedef {{current?: AutoSubmitInputElement}} AutoSubmitInputRef */
/**
 * @typedef {{
 *   attribute?: string,
 *   model?: {update: (params: Record<string, boolean | number | string>) => void},
 *   inputRef?: AutoSubmitInputRef,
 *   inputProps?: {ref?: AutoSubmitInputRef}
 * }} AutoSubmitComponentProps
 */
/** @typedef {{props: AutoSubmitComponentProps, inputProps?: {ref?: AutoSubmitInputRef}, inputRef?: AutoSubmitInputRef}} AutoSubmitComponent */

/** Auto-submit helper for input components. */
export default class ApiMakerInputsAutoSubmit {
  /** @param {{component: AutoSubmitComponent}} args */
  constructor ({component}) {
    this.component = component
  }

  /** @returns {void} */
  autoSubmit () {
    const {attribute, model} = this.component.props
    const updateAttributeName = inflection.underscore(attribute)
    const updateParams = /** @type {Record<string, boolean | number | string>} */ ({})

    updateParams[updateAttributeName] = this.value()

    model.update(updateParams)
  }

  /** @returns {boolean | number | string} */
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
