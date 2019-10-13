import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React from "react"

const inflection = require("inflection")

export default class BootstrapRadioButtons extends React.Component {
  static propTypes = PropTypesExact({
    attribute: PropTypes.string,
    defaultValue: PropTypes.array,
    label: PropTypes.string,
    labelClassName: PropTypes.string,
    model: PropTypes.object,
    name: PropTypes.string,
    options: PropTypes.array.isRequired
  })

  render() {
    return (
      <div className="component-bootstrap-checkboxes form-group">
        <label className={this.labelClassName()}>
          {this.label()}
        </label>

        <input name={this.inputName()} type="hidden" value="" />
        {this.props.options.map((option, index) => this.optionElement(option, index))}
      </div>
    )
  }

  inputDefaultValue() {
    if (this.props.defaultValue) {
      return this.props.defaultValue
    } else if (this.props.model) {
      if (!this.props.model[this.props.attribute])
        throw `No such attribute: ${this.props.attribute}`

      return this.props.model[this.props.attribute]()
    }
  }

  inputName() {
    if (this.props.name) {
      return `${this.props.name}[]`
    } else if (this.props.model) {
      return `${this.props.model.modelClassData().paramKey}[${inflection.underscore(this.props.attribute)}]`
    }
  }

  isDefaultSelected(option) {
    let defaultValue = this.inputDefaultValue()

    if (!defaultValue)
      return false

    if (defaultValue.constructor === Array) {
      return defaultValue.includes(option)
    } else {
      return defaultValue == option
    }
  }

  label() {
    if (this.props.label === false) {
      return null
    } else if (this.props.label) {
      return this.props.label
    } else if (this.props.model) {
      return this.props.model.modelClass().humanAttributeName(this.props.attribute)
    }
  }

  labelClassName() {
    let classNames = []

    if (this.props.labelClassName)
      classNames.push(this.props.labelClassName)

    return classNames.join(" ")
  }

  generatedId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  optionElement(option) {
    var id = this.generatedId()

    return (
      <div className="checkboxes-option" key={`option-${option[1]}`}>
        <input defaultChecked={this.isDefaultSelected(option[1])} id={id} name={this.inputName()} type="checkbox" value={option[1]} /> <label htmlFor={id}>{option[0]}</label>
      </div>
    )
  }
}
