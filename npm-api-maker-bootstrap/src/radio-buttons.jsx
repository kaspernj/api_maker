import {digs} from "@kaspernj/object-digger"
import { EventListener } from "@kaspernj/api-maker"
import InvalidFeedback from "./invalid-feedback"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React from "react"

const inflection = require("inflection")

export default class ApiMakerBootstrapRadioButtons extends React.Component {
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
    onChange: PropTypes.func,
    onMatchValidationError: PropTypes.func,
    wrapperClassName: PropTypes.string
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
      <div className={this.wrapperClassName()}>
        {form &&
          <EventListener event="validation-errors" onCalled={event => this.onValidationErrors(event)} target={form} />
        }
        <input name={this.inputName()} ref="hiddenInput" type="hidden" value="" />
        {this.props.collection.map((option, index) => this.optionElement(option, index))}
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

  inputRadioClassName() {
    const classNames = ["form-check-input"]

    if (this.state.validationErrors.length > 0)
      classNames.push("is-invalid")

    return classNames.join(" ")
  }

  generatedId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  onValidationErrors(event) {
    const validationErrors = event.detail.getValidationErrorsForInput({
      attribute: this.props.attribute,
      inputName: this.inputName(),
      onMatchValidationError: this.props.onMatchValidationError
    })
    this.setState({validationErrors})
  }

  optionElement(option, index) {
    const {collection} = digs(this.props, "collection")
    const {onChange} = this.props
    const {validationErrors} = this.state
    const id = this.generatedId()

    return (
      <div className="form-check" key={`option-${option[1]}`}>
        <input
          className={this.inputRadioClassName()}
          data-option-value={option[1]}
          defaultChecked={option[1] == this.inputDefaultValue()}
          id={id}
          name={this.inputName()}
          onChange={onChange}
          type="radio"
          value={option[1]}
        />

        <label className="form-check-label" htmlFor={id}>
          {option[0]}
        </label>

        {(index + 1) == collection.length && validationErrors.length > 0 &&
          <InvalidFeedback errors={validationErrors} />
        }
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
