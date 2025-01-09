import BaseComponent from "../base-component"
import inputWrapper from "./input-wrapper"
import memo from "set-state-compare/src/memo"
import PropTypes from "prop-types"
import React from "react"
import {shapeComponent} from "set-state-compare/src/shape-component"
import {useForm} from "../form"

const ApiMakerInputsSelect = memo(shapeComponent(class ApiMakerInputsSelect extends BaseComponent {
  static propTypes = {
    attribute: PropTypes.string,
    children: PropTypes.node,
    defaultValue: PropTypes.oneOfType([PropTypes.array, PropTypes.number, PropTypes.string]),
    id: PropTypes.string,
    includeBlank: PropTypes.oneOfType([PropTypes.bool, PropTypes.node]),
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
            {typeof includeBlank != "boolean" ? includeBlank : null}
          </option>
        }
        {options && options.map((option) =>
          <option key={this.optionKey(option)} value={this.optionValue(option)}>
            {this.optionLabel(option)}
          </option>
        )}
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
    if (this.props.includeBlank && !this.props.multiple) {
      return true
    } else {
      return false
    }
  }
}))

export {ApiMakerInputsSelect as Select}
export default inputWrapper(ApiMakerInputsSelect)
