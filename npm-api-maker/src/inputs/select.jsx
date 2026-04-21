// @ts-check
/* eslint-disable sort-imports */
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import {useForm} from "../form"
import PropTypes from "prop-types"
import React from "react"
import inputWrapper from "./input-wrapper"
import memo from "set-state-compare/build/memo.js"

/**
 * @typedef {object} Props
 * @property {string} [attribute]
 * @property {any} [children]
 * @property {any[]|number|string} [defaultValue]
 * @property {string} [id]
 * @property {boolean|any} [includeBlank]
 * @property {object} inputProps
 * @property {object} [model]
 * @property {string} [name]
 * @property {Function} [onChange]
 * @property {any[]} [options]
 * @property {object} wrapperOpts
 */
/** @typedef {Record<string, never>} State */
const ApiMakerInputsSelect = memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class ApiMakerInputsSelect extends ShapeComponent {
  static propTypes = {
    attribute: PropTypes.string,
    children: PropTypes.any,
    defaultValue: PropTypes.oneOfType([PropTypes.array, PropTypes.number, PropTypes.string]),
    id: PropTypes.string,
    includeBlank: PropTypes.oneOfType([PropTypes.bool, PropTypes.any]),
    inputProps: PropTypes.object.isRequired,
    model: PropTypes.object,
    name: PropTypes.string,
    onChange: PropTypes.func,
    options: PropTypes.array,
    wrapperOpts: PropTypes.object.isRequired
  }

  setup() {
    this.form = useForm()
  }

  render () {
    const {
      attribute,
      children,
      defaultValue,
      id,
      includeBlank,
      inputProps,
      inputRef,
      model,
      name,
      onChange,
      options,
      wrapperOpts,
      ...restProps
    } = this.props

    return (
      <select onChange={this.tt.onChange} {...inputProps} {...restProps}>
        {this.includeBlank() &&
          <option data-include-blank="true">
            {typeof includeBlank == "boolean" ? null : includeBlank}
          </option>
        }
        {options && options.map((option) => (
          <option key={this.optionKey(option)} value={this.optionValue(option)}>
            {this.optionLabel(option)}
          </option>
        ))}
        {children}
      </select>
    )
  }

  onChange = (e) => {
    const {form} = this.tt
    const {name, onChange} = this.props

    if (form && name) form.setValue(name, e.target.value)
    if (onChange) onChange(e)
  }

  optionKey (option) {
    if (Array.isArray(option)) {
      return `select-option-${option[1]}`
    } else {
      return `select-option-${option}`
    }
  }

  optionLabel (option) {
    if (Array.isArray(option)) {
      return option[0]
    } else {
      return option
    }
  }

  optionValue (option) {
    if (Array.isArray(option)) {
      return option[1]
    } else {
      return option
    }
  }

  includeBlank () {
    return Boolean(this.props.includeBlank && !this.props.multiple)
  }
}))

export {ApiMakerInputsSelect as Select}
export default inputWrapper(ApiMakerInputsSelect)
