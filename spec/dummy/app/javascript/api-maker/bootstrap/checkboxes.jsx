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
    const { form, validationErrors } = this.state

    return (
      <div className="component-bootstrap-checkboxes form-group">
        {form && <EventListener event="validation-errors" onCalled={event => this.onValidationErrors(event)} target={form} />}
        <label className={this.labelClassName()}>
          {this.label()}
        </label>

        <input name={this.inputName()} ref="hiddenInput" type="hidden" value="" />
        {this.props.options.map((option, index) => this.optionElement(option, index))}
        {validationErrors.length > 0 && <InvalidFeedback errors={validationErrors} />}
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

  onValidationErrors(event) {
    const validationErrors = event.detail.getValidationErrors(this.props.attribute, this.inputName())
    this.setState({validationErrors})
  }

  optionElement(option) {
    const id = this.generatedId()

    return (
      <div className="checkboxes-option" key={`option-${option[1]}`}>
        <input
          data-option-value={option[1]}
          defaultChecked={this.isDefaultSelected(option[1])}
          id={id}
          name={this.inputName()}
          type="checkbox"
          value={option[1]} />

        <label className="ml-1" htmlFor={id}>
          {option[0]}
        </label>
      </div>
    )
  }
}
