import EventListener from "api-maker/event-listener"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React from "react"

const inflection = require("inflection")

export default class BootstrapCheckboxes extends React.Component {
  static propTypes = PropTypesExact({
    attribute: PropTypes.string,
    defaultValue: PropTypes.array,
    label: PropTypes.string,
    labelClassName: PropTypes.string,
    model: PropTypes.object,
    name: PropTypes.string,
    options: PropTypes.array.isRequired
  })

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
    const form = this.refs.hiddenInput && this.refs.hiddenInput.form
    if (form != this.state.form) this.setState({form})
  }

  render() {
    const { form } = this.state

    return (
      <div className="component-bootstrap-checkboxes form-group">
        {form && <EventListener event="validation-errors" onCalled={event => this.onValidationErrors(event)} target={form} />}
        <label className={this.labelClassName()}>
          {this.label()}
        </label>

        <input name={this.inputName()} ref="hiddenInput" type="hidden" value="" />
        {this.props.options.map((option, index) => this.optionElement(option, index))}
      </div>
    )
  }

  inputDefaultValue() {
    const { attribute, defaultValue, model } = this.props

    if (defaultValue) {
      return defaultValue
    } else if (attribute && model) {
      if (!model[attribute])
        throw `No such attribute: ${attribute}`

      return this.props.model[attribute]()
    }
  }

  inputCheckboxClassName() {
    const classNames = []

    if (this.state.validationErrors.length > 0)
      classNames.push("is-invalid")

    return classNames.join(" ")
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
    const { attribute, label, model } = this.props

    if ("label" in this.props) {
      return label
    } else if (attribute && model) {
      return model.modelClass().humanAttributeName(attribute)
    }
  }

  labelClassName() {
    const classNames = []

    if (this.props.labelClassName)
      classNames.push(this.props.labelClassName)

    return classNames.join(" ")
  }

  generatedId() {
    if (!this.generatedIdValue)
      this.generatedIdValue = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    return this.generatedIdValue
  }

  onValidationErrors(event) {
    const validationErrors = event.detail.getValidationErrorsForInput(this.props.attribute, this.inputName())
    this.setState({validationErrors})
  }

  optionElement(option, index) {
    const { options } = this.props
    const { validationErrors } = this.state
    const id = `${this.generatedId()}-${index}`

    return (
      <div className="checkboxes-option" key={`option-${option[1]}`}>
        <input
          className={this.inputCheckboxClassName()}
          data-option-value={option[1]}
          defaultChecked={this.isDefaultSelected(option[1])}
          id={id}
          name={this.inputName()}
          type="checkbox"
          value={option[1]}
        />

        <label className="ml-1" htmlFor={id}>
          {option[0]}
        </label>

        {(index + 1) == options.length && validationErrors.length > 0 &&
          <InvalidFeedback errors={validationErrors} />
        }
      </div>
    )
  }
}
