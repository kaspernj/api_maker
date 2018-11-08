import changeCase from "change-case"
import React from "react"

export default class BootstrapRadioButtons extends React.Component {
  render() {
    return (
      <div>
        {this.props.collection.map(option => this.optionElement(option))}
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
      return this.props.name
    } else if (this.props.model) {
      return `${this.props.model.modelClassData().paramKey}[${changeCase.snakeCase(this.props.attribute)}]`
    }
  }

  generatedId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  optionElement(option) {
    var id = this.generatedId()

    return (
      <div key={`option-${option[1]}`}>
        <input defaultChecked={option[1] == this.inputDefaultValue()} id={id} name={this.inputName()} type="radio" value={option[1]} /> <label htmlFor={id}>{option[0]}</label>
      </div>
    )
  }
}
