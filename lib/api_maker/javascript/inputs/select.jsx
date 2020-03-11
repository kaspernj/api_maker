import EventListener from "api-maker/event-listener"
import InvalidFeedback from "api-maker/bootstrap/invalid-feedback"
import PropTypes from "prop-types"
import React from "react"

const inflection = require("inflection")

export default class BootstrapSelect extends React.Component {
  static propTypes = {
    attribute: PropTypes.string,
    children: PropTypes.node,
    className: PropTypes.string,
    defaultValue: PropTypes.oneOfType([PropTypes.array, PropTypes.number, PropTypes.string]),
    id: PropTypes.string,
    includeBlank: PropTypes.bool,
    model: PropTypes.object,
    name: PropTypes.string,
    options: PropTypes.array
  }

  constructor(props) {
    super(props)
    this.state = {
      validationErrors: []
    }
  }

  componentDidMount() {
    this.setForm()
  }

  componentDidUpdate() {
    this.setForm()
  }

  setForm() {
    const form = this.refs.select && this.refs.select.form
    if (form != this.state.form) this.setState({form})
  }

  render() {
    const { attribute, children, className, defaultValue, id, includeBlank, model, name, placeholder, options, ...restProps } = this.props
    const { form, validationErrors } = this.state

    return (
      <>
        {form && <EventListener event="validation-errors" onCalled={event => this.onValidationErrors(event)} target={form} />}
        <select
          {...restProps}
          defaultValue={this.inputDefaultValue()}
          className={this.selectClassName()}
          id={this.inputId()}
          name={this.inputName()}
          ref="select"
          >
          {this.includeBlank() &&
            <option />
          }
          {options && this.props.options.map(option => (
            <option key={`select-option-${option[1]}`} value={option[1]}>{option[0]}</option>
          ))}
          {children}
        </select>
        {validationErrors.length > 0 && <InvalidFeedback errors={validationErrors} />}
      </>
    )
  }

  includeBlank() {
    if (this.props.includeBlank || !this.props.multiple) {
      return true
    } else {
      return false
    }
  }

  inputDefaultValue() {
    if ("defaultValue" in this.props) {
      return this.props.defaultValue
    } else if (this.props.selected) {
      return this.props.selected
    } else if (this.props.model) {
      if (!this.props.model[this.props.attribute])
        throw new Error(`No attribute by that name: ${this.props.attribute}`)

      return this.props.model[this.props.attribute]()
    }
  }

  inputId() {
    if ("id" in this.props) {
      return this.props.id
    } else if (this.props.model) {
      return `${this.props.model.modelClassData().paramKey}_${inflection.underscore(this.props.attribute)}`
    }
  }

  inputName() {
    if ("name" in this.props) {
      return this.props.name
    } else if (this.props.model) {
      return `${this.props.model.modelClassData().paramKey}[${inflection.underscore(this.props.attribute)}]`
    }
  }

  onValidationErrors(event) {
    const validationErrors = event.detail.getValidationErrorsForInput(this.props.attribute, this.inputName())
    this.setState({validationErrors})
  }

  selectClassName() {
    const classNames = []

    if (this.props.className) classNames.push(this.props.className)

    if (this.state.validationErrors.length > 0)
      classNames.push("is-invalid")

    return classNames.join(" ")
  }
}
