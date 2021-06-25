const AutoSubmit = require("./auto-submit.cjs")
const {dig, digg, digs} = require("@kaspernj/object-digger")
const {EventListener, EventUpdated} = require("@kaspernj/api-maker")
const idForComponent = require("./id-for-component.cjs")
const nameForComponent = require("./name-for-component.cjs")
const PropTypes = require("prop-types")
const React = require("react")
const replaceall = require("replaceall")
const strftime = require("strftime")

export default class ApiMakerInput extends React.Component {
  static defaultProps = {
    autoRefresh: false,
    autoSubmit: false,
    localizedNumber: false
  }
  static propTypes = {
    attribute: PropTypes.string,
    autoRefresh: PropTypes.bool.isRequired,
    autoSubmit: PropTypes.bool.isRequired,
    className: PropTypes.string,
    formatValue: PropTypes.func,
    id: PropTypes.string,
    inputRef: PropTypes.object,
    localizedNumber: PropTypes.bool.isRequired,
    model: PropTypes.object,
    name: PropTypes.string,
    onChange: PropTypes.func,
    onErrors: PropTypes.func,
    onMatchValidationError: PropTypes.func,
    type: PropTypes.string
  }

  inputRef = React.createRef()
  visibleInputRef = React.createRef()
  state = {
    blankInputName: this.props.type == "file",
    form: undefined
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
    const form = dig(this.props.inputRef || this.inputRef, "current", "form")

    if (form != this.state.form) {
      this.setState({form})
    }
  }

  render() {
    const {
      attribute,
      autoRefresh,
      autoSubmit,
      defaultValue,
      formatValue,
      id,
      inputRef,
      localizedNumber,
      model,
      name,
      onChange,
      onErrors,
      onMatchValidationError,
      type,
      ...restProps
    } = this.props
    const {form} = digs(this.state, "form")

    return (
      <>
        {autoRefresh && model &&
          <EventUpdated model={model} onUpdated={(...args) => this.onModelUpdated(...args)} />
        }
        {form && onErrors && <EventListener event="validation-errors" onCalled={(event) => this.onValidationErrors(event)} target={form} />}
        {localizedNumber &&
          <input
            defaultValue={this.inputDefaultValue()}
            id={this.inputId()}
            name={this.inputName()}
            ref={this.inputReference()}
            type="hidden"
          />
        }
        {type == "textarea" &&
          <textarea
            defaultValue={this.inputDefaultValueLocalized()}
            id={localizedNumber ? null : this.inputId()}
            name={localizedNumber ? null : this.inputName()}
            onChange={(e) => this.onInputChanged(e)}
            ref={localizedNumber ? this.visibleInputRef : this.inputReference()}
            type={this.inputType()}
            {...restProps}
          />
        }
        {type != "textarea" &&
          <input
            defaultValue={this.inputDefaultValueLocalized()}
            id={localizedNumber ? null : this.inputId()}
            name={localizedNumber ? null : this.inputName()}
            onChange={(e) => this.onInputChanged(e)}
            ref={localizedNumber ? this.visibleInputRef : this.inputReference()}
            type={this.inputType()}
            {...restProps}
          />
        }
      </>
    )
  }

  actualValue(visibleInput) {
    const {localizedNumber} = digs(this.props, "localizedNumber")
    const value = digg(visibleInput, "value")

    if (localizedNumber) {
      const decimal = I18n.t("number.currency.format.separator")
      const integerSeparator = I18n.t("number.currency.format.delimiter")

      let unformatted = replaceall(integerSeparator, "", value)

      unformatted = replaceall(decimal, ".", unformatted)

      return unformatted
    }

    return value
  }

  autoSubmit() {
    new AutoSubmit({component: this}).autoSubmit()
  }

  formatValue(value) {
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

  inputDefaultValueLocalized() {
    const {localizedNumber} = digs(this.props, "localizedNumber")

    let value = this.inputDefaultValue()

    if (localizedNumber && value !== null && value !== undefined) {
      const separator = I18n.t("number.currency.format.separator")
      const delimiter = I18n.t("number.currency.format.delimiter")

      let formatted = `${value}`

      formatted = replaceall(".", "{{separator}}", formatted)
      formatted = replaceall(",", "{{delimiter}}", formatted)
      formatted = replaceall("{{separator}}", separator, formatted)
      formatted = replaceall("{{delimiter}}", delimiter, formatted)

      return formatted
    }

    return value
  }

  inputId() {
    return idForComponent(this)
  }

  inputName() {
    if (this.state.blankInputName)
      return ""

    return nameForComponent(this)
  }

  inputReference() {
    return this.props.inputRef || this.inputRef
  }

  inputType() {
    if (this.props.type) {
      return this.props.type
    } else {
      return "text"
    }
  }

  onModelUpdated(args) {
    const inputRef = this.props.inputRef || this.inputRef

    if (!inputRef.current) {
      // This can happen if the component is being unmounted
      return
    }

    const {attribute} = digs(this.props, "attribute")
    const newModel = digg(args, "model")
    const currentValue = digg(inputRef, "current", "value")
    const newValue = newModel.readAttribute(attribute)
    const newFormattedValue = this.formatValue(newValue)

    if (currentValue != newFormattedValue) {
      inputRef.current.value = newFormattedValue
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
    const { attribute, autoSubmit, model, onChange, type } = this.props
    const { localizedNumber } = digs(this.props, "localizedNumber")
    const input = digg(e, "target")

    if (localizedNumber) {
      this.inputReference().current.value = this.actualValue(input)
    }

    if (attribute && autoSubmit && model) this.delayAutoSubmit()
    if (type == "file") this.setState({blankInputName: this.getBlankInputName()})
    if (onChange) onChange(e)
  }

  delayAutoSubmit() {
    if (this.delayAutoSubmitTimeout) {
      clearTimeout(this.delayAutoSubmitTimeout)
    }

    this.delayAutoSubmitTimeout = setTimeout(() => this.autoSubmit(), 200)
  }

  // This fixes an issue in Firefox and ActiveStorage, where uploads would be a blank string if a file wasn't chosen
  getBlankInputName() {
    const value = dig(this.props.inputRef || this.inputRef, "current", "value")

    if (this.props.type == "file" && value == "")
      return true
  }
}
