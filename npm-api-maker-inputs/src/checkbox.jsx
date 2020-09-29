import {digs} from "@kaspernj/object-digger"
import idForComponent from "./id-for-component"
import nameForComponent from "./name-for-component"
import PropTypes from "prop-types"
import React from "react"

export default class ApiMakerCheckbox extends React.Component {
  static defaultProps = {
    defaultValue: 1,
    zeroInput: true
  }

  static propTypes = {
    attribute: PropTypes.string,
    defaultChecked: PropTypes.bool,
    defaultValue: PropTypes.node,
    id: PropTypes.string,
    model: PropTypes.object,
    name: PropTypes.string,
    onErrors: PropTypes.func,
    onMatchValidationError: PropTypes.func,
    zeroInput: PropTypes.bool
  }

  constructor(props) {
    super(props)
    this.state = {
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
    const form = this.refs.checkbox && this.refs.checkbox.refs.input && this.refs.checkbox.refs.input.form

    if (form != this.state.form) {
      this.setState({form})
    }
  }

  render() {
    const {attribute, defaultChecked, defaultValue, id, model, name, onErrors, zeroInput, ...restProps} = this.props
    const {form} = digs(this.state, "form")
    const inputName = this.inputName()

    return (
      <>
        {form && onErrors && <EventListener event="validation-errors" onCalled={event => this.onValidationErrors(event)} target={form} />}
        {zeroInput && inputName &&
          <input defaultValue="0" name={inputName} type="hidden" type="hidden" />
        }
        <input
          defaultChecked={this.inputDefaultChecked()}
          defaultValue={defaultValue}
          id={this.inputId()}
          name={inputName}
          ref="input"
          type="checkbox"
          {...restProps}
        />
      </>
    )
  }

  inputDefaultChecked() {
    if ("defaultChecked" in this.props) {
      return this.props.defaultChecked
    } else if (this.props.model) {
      if (!this.props.model[this.props.attribute])
        throw new Error(`No such attribute: ${this.props.attribute}`)

      return this.props.model[this.props.attribute]()
    }
  }

  inputId() {
    return idForComponent(this)
  }

  inputName() {
    return nameForComponent(this)
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
}
