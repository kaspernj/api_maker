const classNames = require("classnames")
const {digs} = require("diggerize")
const {EventListener} = require("@kaspernj/api-maker")
const React = require("react")
const idForComponent = require("./id-for-component.cjs")
const nameForComponent = require("./name-for-component.cjs")
const strftime = require("strftime")

const inputWrapper = (WrapperComponentClass, wrapperOptions = {}) => {
  return class ApiMakerInputWrapper extends React.PureComponent {
    state = {
      errors: [],
      form: undefined
    }

    componentDidMount() {
      if (this.props.onErrors) this.setForm()
    }

    componentDidUpdate() {
      if (this.props.onErrors) this.setForm()
    }

    render() {
      const {className, ...restProps} = this.props
      const {errors, form} = digs(this.state, "errors", "form")
      const type = this.inputType()
      const inputProps = {
        id: idForComponent(this),
        name: nameForComponent(this),
        ref: this.inputRef(),
        type
      }

      if (this.handleAsCheckbox()) {
        inputProps.defaultChecked = this.inputDefaultChecked()
      } else {
        inputProps.defaultValue = this.inputDefaultValue()
      }

      return (
        <>
          {form &&
            <EventListener event="validation-errors" onCalled={digg(this, "onValidationErrors")} target={form} />
          }
          <WrapperComponentClass
            className={classNames("api-maker-inputs-wrapper", className)}
            errors={errors}
            form={form}
            inputProps={inputProps}
            label={this.label()}
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
      if (!("type" in this.props) && wrapperOptions == "checkbox") return true

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
      } else if (this.props.model) {
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

      if (inputElement) form = digg(inputElement, "form")
      if (form != this.state.form) this.setState({form})
    }
  }
}

export default inputWrapper
