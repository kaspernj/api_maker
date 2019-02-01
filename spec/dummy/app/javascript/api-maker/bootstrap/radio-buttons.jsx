import React from "react"

const inflection = require("inflection")

export default class BootstrapRadioButtons extends React.Component {
  render() {
    return (
      <div className="component-bootstrap-radio-buttons">
        {this.props.collection.map(option => this.optionElement(option))}
      </div>
    )
  }

  inputDefaultValue() {
    if (this.props.defaultValue) {
      return this.props.defaultValue
    } else if (this.props.model) {
      if (!this.props.model[this.props.attribute])
        throw new Error(`No such attribute: ${this.props.attribute}`)

      return this.props.model[this.props.attribute]()
    }
  }

  inputName() {
    if (this.props.name) {
      return this.props.name
    } else if (this.props.model) {
      return `${this.props.model.modelClassData().paramKey}[${inflection.underscore(this.props.attribute)}]`
    }
  }

  generatedId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  optionElement(option) {
    let id = this.generatedId()

    return (
      <div key={`option-${option[1]}`}>
        <input defaultChecked={option[1] == this.inputDefaultValue()} id={id} name={this.inputName()} type="radio" value={option[1]} /> <label htmlFor={id}>{option[0]}</label>
      </div>
    )
  }
}
