import idForComponent from "./id-for-component"
import nameForComponent from "./name-for-component"
import PropTypes from "prop-types"
import React from "react"

export default class ApiMakerBootstrapSelect extends React.Component {
  static propTypes = {
    attribute: PropTypes.string,
    children: PropTypes.node,
    defaultValue: PropTypes.oneOfType([PropTypes.array, PropTypes.number, PropTypes.string]),
    id: PropTypes.string,
    includeBlank: PropTypes.bool,
    model: PropTypes.object,
    name: PropTypes.string,
    options: PropTypes.array
  }

  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    const {
      attribute,
      children,
      defaultValue,
      id,
      includeBlank,
      model,
      name,
      options,
      ...restProps
    } = this.props

    return (
      <select
        defaultValue={this.inputDefaultValue()}
        id={this.inputId()}
        name={this.inputName()}
        ref="select"
        {...restProps}
      >
        {this.includeBlank() &&
          <option />
        }
        {options && options.map(option =>
          <option key={`select-option-${option[1]}`} value={option[1]}>
            {option[0]}
          </option>
        )}
        {children}
      </select>
    )
  }

  includeBlank() {
    if (this.props.includeBlank && !this.props.multiple) {
      return true
    } else {
      return false
    }
  }

  inputDefaultValue() {
    if ("defaultValue" in this.props) {
      return this.props.defaultValue
    } else if (this.props.model) {
      if (!this.props.model[this.props.attribute])
        throw new Error(`No attribute by that name: ${this.props.attribute}`)

      return this.props.model[this.props.attribute]()
    }
  }

  inputId() {
    return idForComponent(this)
  }

  inputName() {
    return nameForComponent(this)
  }
}
