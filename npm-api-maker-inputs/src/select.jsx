import {dig} from "diggerize"
import inputWrapper from "./input-wrapper"
import PropTypes from "prop-types"
import React from "react"

class ApiMakerInputsSelect extends React.PureComponent {
  static propTypes = {
    attribute: PropTypes.string,
    children: PropTypes.node,
    defaultValue: PropTypes.oneOfType([PropTypes.array, PropTypes.number, PropTypes.string]),
    id: PropTypes.string,
    includeBlank: PropTypes.oneOfType([PropTypes.bool, PropTypes.node]),
    inputProps: PropTypes.object.isRequired,
    model: PropTypes.object,
    name: PropTypes.string,
    options: PropTypes.array,
    wrapperOpts: PropTypes.object.isRequired
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
      options,
      wrapperOpts,
      ...restProps
    } = this.props

    return (
      <select {...inputProps} {...restProps}>
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
}

export {ApiMakerInputsSelect as Select}
export default inputWrapper(ApiMakerInputsSelect)
