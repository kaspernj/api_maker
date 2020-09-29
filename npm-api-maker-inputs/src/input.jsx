import {dig, digs} from "@kaspernj/object-digger"
import {EventListener} from "@kaspernj/api-maker"
import idForComponent from "./id-for-component"
import nameForComponent from "./name-for-component"
import PropTypes from "prop-types"
import React from "react"

export default class ApiMakerInput extends React.Component {
  static propTypes = {
    attribute: PropTypes.string,
    className: PropTypes.string,
    id: PropTypes.string,
    model: PropTypes.object,
    name: PropTypes.string,
    onChange: PropTypes.func,
    onErrors: PropTypes.func,
    onMatchValidationError: PropTypes.func,
    type: PropTypes.string
  }

  constructor(props) {
    super(props)
    this.state = {
      blankInputName: this.props.type == "file",
      form: undefined
    }
  }

  componentDidMount() {
    if (this.props.onErrors) {
      this.setForm()
    }
  }

  componentDidUpdate() {
    if (this.props.onErrors) {
      this.setForm()
    }
  }

  setForm() {
    const form = dig(this, "refs", "input", "form")

    if (form != this.state.form) {
      this.setState({form})
    }
  }

  render() {
    const {attribute, id, model, name, onChange, onErrors, onMatchValidationError, type, ...restProps} = this.props
    const {form} = digs(this.state, "form")

    return (
      <>
        {form && onErrors && <EventListener event="validation-errors" onCalled={(event) => this.onValidationErrors(event)} target={form} />}
        {type == "textarea" &&
          <textarea
            defaultValue={this.inputDefaultValue()}
            id={this.inputId()}
            name={this.inputName()}
            onChange={(e) => this.onInputChanged(e)}
            ref="input"
            type={this.inputType()}
            {...restProps}
          />
        }
        {type != "textarea" &&
          <input
            defaultValue={this.inputDefaultValue()}
            id={this.inputId()}
            name={this.inputName()}
            onChange={(e) => this.onInputChanged(e)}
            ref="input"
            type={this.inputType()}
            {...restProps}
          />
        }
      </>
    )
  }

  formatValue(value) {
    // We need to use a certain format for datetime-local
    if (this.inputType() == "datetime-local" && value instanceof Date) {
      return I18n.strftime(value, "%Y-%m-%dT%H:%M:%S")
    } else if (this.inputType() == "date" && value instanceof Date) {
      return I18n.strftime(value, "%Y-%m-%d")
    }

    return value
  }

  inputDefaultValue() {
    if ("defaultValue" in this.props) {
      return this.formatValue(this.props.defaultValue)
    } else if (this.props.model) {
      if (!this.props.model[this.props.attribute])
        throw new Error(`No such attribute: ${this.props.model.modelClassData().name}#${this.props.attribute}`)

      return this.formatValue(this.props.model[this.props.attribute]())
    }
  }

  inputId() {
    return idForComponent(this)
  }

  inputName() {
    if (this.state.blankInputName)
      return ""

    return nameForComponent(this)
  }

  inputType() {
    if (this.props.type) {
      return this.props.type
    } else {
      return "text"
    }
  }

  onValidationErrors(event) {
    const {onErrors} = this.props

    if (!onErrors) {
      return
    }

    const errors = event.detail.getValidationErrorsForInput({
      attribute: this.props.attribute,
      inputName: this.inputName(),
      onMatchValidationError: this.props.onMatchValidationError
    })

    onErrors(errors)
  }

  onInputChanged(e) {
    const { onChange, type } = this.props

    if (type == "file") this.setState({blankInputName: this.getBlankInputName()})
    if (onChange) onChange(e)
  }

  // This fixes an issue in Firefox and ActiveStorage, where uploads would be a blank string if a file wasn't chosen
  getBlankInputName() {
    const value = this.refs.input.value

    if (this.props.type == "file" && value == "")
      return true
  }
}
