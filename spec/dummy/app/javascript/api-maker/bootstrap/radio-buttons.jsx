import EventListener from "api-maker/event-listener"
import InvalidFeedback from "./invalid-feedback"
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

  constructor(props) {
    super(props)
    this.state = {}
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
      <div className={this.wrapperClassName()}>
        {form &&
          <EventListener event="validation-errors" onCalled={event => this.onValidationErrors(event)} target={form} />
        }
        <input name={this.inputName()} ref="hiddenInput" type="hidden" value="" />
        {this.props.collection.map(option => this.optionElement(option))}
        {validationErrors.length > 0 && <InvalidFeedback errors={validationErrors.map(validationError => validationError.message)} />}
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

  onValidationErrors(event) {
    const validationErrors = event.detail
    const relevantValidationErrors = validationErrors.getValidationErrorsForName(this.props.attribute, this.inputName())
    this.setState({validationErrors: relevantValidationErrors})
  }

  optionElement(option) {
    const id = this.generatedId()

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
    const classNames = ["component-bootstrap-radio-buttons"]

    if (this.props.wrapperClassName)
      classNames.push(this.props.wrapperClassName)

    return classNames.join(" ")
  }
}
