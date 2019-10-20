import PropTypesExact from "prop-types-exact"
import React from "react"

const inflection = require("inflection")

export default class BootstrapRadioButtons extends React.Component {
  static propTypes = PropTypesExact({
    attribute: PropTypes.string,
    collection: PropTypes.array.isRequired,
    defaultValue: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    id: PropTypes.string,
    name: PropTypes.string,
    model: PropTypes.object,
    wrapperClassName: PropTypes.string
  })

  render() {
    return (
      <div className={this.wrapperClassName()}>
        <input name={this.inputName()} type="hidden" value="" />
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
        <input
          data-option-value={option[1]}
          defaultChecked={option[1] == this.inputDefaultValue()}
          id={id}
          name={this.inputName()}
          type="radio"
          value={option[1]} />

        <label className="ml-1" htmlFor={id}>
          {option[0]}
        </label>
      </div>
    )
  }

  wrapperClassName() {
    var classNames = ["component-bootstrap-radio-buttons"]

    if (this.props.wrapperClassName)
      classNames.push(this.props.wrapperClassName)

    return classNames.join(" ")
  }
}
