import {dig, digg, digs} from "diggerize"
import EventListener from "../event-listener"
import React from "react"
import idForComponent from "./id-for-component.mjs"
import nameForComponent from "./name-for-component.mjs"
import strftime from "strftime"

const inputWrapper = (WrapperComponentClass, wrapperOptions = {}) => {
  return class ApiMakerInputWrapper extends React.PureComponent {
    state = {
      errors: [],
      form: undefined
    }

    componentDidMount() {
      this.setForm()
    }

    componentDidUpdate() {
      this.setForm()
    }

    inputProps() {
      const givenInputProps = this.props.inputProps || {}
      const inputProps = Object.assign(
        {
          id: idForComponent(this),
          name: nameForComponent(this),
          ref: this.inputRef()
        },
        givenInputProps
      )

      if (this.handleAsCheckbox()) {
        inputProps.defaultChecked = this.inputDefaultChecked()
      } else {
        inputProps.defaultValue = this.inputDefaultValue()
      }

      return inputProps
    }

    render() {
      const {inputProps: oldInputProps, ...restProps} = this.props
      const {errors, form} = digs(this.state, "errors", "form")
      const type = this.inputType()
      const inputProps = this.inputProps()

      if (!inputProps.ref) throw new Error("No input ref?")
      if (!this.handleAsSelect()) inputProps.type = type

      const wrapperOpts = {
        errors,
        form,
        label: this.label()
      }

      return (
        <>
          {form &&
            <EventListener event="validation-errors" onCalled={digg(this, "onValidationErrors")} target={form} />
          }
          <WrapperComponentClass
            inputProps={inputProps}
            wrapperOpts={wrapperOpts}
            {...restProps}
          />
        </>
      )
    }

    formatValue (value) {
      const {formatValue} = this.props

      if (formatValue) {
        return formatValue(value)
      } else if (value instanceof Date && !isNaN(value.getTime())) {
        // We need to use a certain format for datetime-local
        if (this.inputType() == "datetime-local") {
          return strftime("%Y-%m-%dT%H:%M:%S", value)
        } else if (this.inputType() == "date") {
          return strftime("%Y-%m-%d", value)
        }
      }

      return value
    }

    handleAsCheckbox() {
      if (this.props.type == "checkbox") return true
      if (!("type" in this.props) && wrapperOptions.type == "checkbox") return true

      return false
    }

    handleAsSelect() {
      if (wrapperOptions.type == "select") return true

      return false
    }

    inputDefaultChecked () {
      if ("defaultChecked" in this.props) {
        return this.props.defaultChecked
      } else if (this.props.model) {
        if (!this.props.model[this.props.attribute])
          throw new Error(`No such attribute: ${this.props.attribute}`)

        return this.props.model[this.props.attribute]()
      }
    }

    inputDefaultValue() {
      if ("defaultValue" in this.props) {
        return this.formatValue(this.props.defaultValue)
      } else if (this.props.model) {
        if (!this.props.model[this.props.attribute]) {
          throw new Error(`No such attribute: ${digg(this.props.model.modelClassData(), "name")}#${this.props.attribute}`)
        }

        return this.formatValue(this.props.model[this.props.attribute]())
      }
    }

    inputName() {
      if (this.state.blankInputName) return ""

      return nameForComponent(this)
    }

    inputRefBackup() {
      if (!this._inputRefBackup) this._inputRefBackup = React.createRef()

      return this._inputRefBackup
    }

    inputRef() {
      return this.props.inputRef || this.inputRefBackup()
    }

    inputType() {
      if ("type" in this.props) {
        return this.props.type
      } else if (wrapperOptions.type == "checkbox") {
        return "checkbox"
      } else {
        return "text"
      }
    }

    label() {
      if ("label" in this.props) {
        return this.props.label
      } else if (this.props.attribute && this.props.model) {
        return this.props.model.modelClass().humanAttributeName(this.props.attribute)
      }
    }

    onValidationErrors = (event) => {
      const errors = event.detail.getValidationErrorsForInput({
        attribute: this.props.attribute,
        inputName: this.inputName(),
        onMatchValidationError: this.props.onMatchValidationError
      })

      this.setState({errors})
    }

    setForm () {
      const inputElement = this.inputRef().current

      let form

      if (inputElement) form = dig(inputElement, "form")
      if (form && form != this.state.form) this.setState({form})
    }
  }
}

export default inputWrapper
