const AutoSubmit = require("./auto-submit.cjs")
const {dig, digg, digs} = require("diggerize")
const {EventUpdated} = require("@kaspernj/api-maker")
const inputWrapper = require("./input-wrapper").default
const PropTypes = require("prop-types")
const React = require("react")
const replaceall = require("replaceall")
const strftime = require("strftime")

class ApiMakerInput extends React.PureComponent {
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
    onMatchValidationError: PropTypes.func,
    type: PropTypes.string
  }

  inputRef = React.createRef()
  visibleInputRef = React.createRef()
  state = {
    blankInputName: this.props.type == "file"
  }

  render () {
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

    return (
      <>
        {autoRefresh && model &&
          <EventUpdated model={model} onUpdated={this.onModelUpdated} />
        }
        {localizedNumber &&
          <input
            defaultValue={this.inputDefaultValue()}
            id={input}
            name={this.inputName()}
            ref={this.inputReference()}
            type="hidden"
          />
        }
        {type == "textarea" &&
          <textarea
            defaultValue={this.inputDefaultValueLocalized()}
            id={localizedNumber ? null : id}
            name={localizedNumber ? null : name}
            onChange={this.onInputChanged}
            ref={localizedNumber ? this.visibleInputRef : this.inputReference()}
            type={type}
            {...restProps}
          />
        }
        {type != "textarea" &&
          <input
            defaultValue={this.inputDefaultValueLocalized()}
            id={localizedNumber ? null : id}
            name={localizedNumber ? null : this.inputName()}
            onChange={this.onInputChanged}
            ref={localizedNumber ? this.visibleInputRef : this.inputReference()}
            type={type}
            {...restProps}
          />
        }
      </>
    )
  }

  actualValue (visibleInput) {
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

  autoSubmit () {
    new AutoSubmit({component: this}).autoSubmit()
  }

  formatValue (value) {
    const {formatValue, type} = this.props

    if (formatValue) {
      return formatValue(value)
    } else if (value instanceof Date && !isNaN(value.getTime())) {
      // We need to use a certain format for datetime-local
      if (type == "datetime-local") {
        return strftime("%Y-%m-%dT%H:%M:%S", value)
      } else if (type == "date") {
        return strftime("%Y-%m-%d", value)
      }
    }

    return value
  }

  inputDefaultValueLocalized () {
    const {defaultValue} = this.props
    const {localizedNumber} = digs(this.props, "localizedNumber")

    if (localizedNumber && defaultValue !== null && defaultValue !== undefined) {
      const separator = I18n.t("number.currency.format.separator")
      const delimiter = I18n.t("number.currency.format.delimiter")

      let formatted = `${defaultValue}`

      formatted = replaceall(".", "{{separator}}", formatted)
      formatted = replaceall(",", "{{delimiter}}", formatted)
      formatted = replaceall("{{separator}}", separator, formatted)
      formatted = replaceall("{{delimiter}}", delimiter, formatted)

      return formatted
    }

    return defaultValue
  }

  inputReference () {
    return this.props.inputRef || this.inputRef
  }

  onModelUpdated = (args) => {
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

  onInputChanged = (e) => {
    const {attribute, autoSubmit, model, onChange, type} = this.props
    const {localizedNumber} = digs(this.props, "localizedNumber")
    const input = digg(e, "target")

    if (localizedNumber) {
      this.inputReference().current.value = this.actualValue(input)
    }

    if (attribute && autoSubmit && model) this.delayAutoSubmit()
    if (type == "file") this.setState({blankInputName: this.getBlankInputName()})
    if (onChange) onChange(e)
  }

  delayAutoSubmit () {
    if (this.delayAutoSubmitTimeout) {
      clearTimeout(this.delayAutoSubmitTimeout)
    }

    this.delayAutoSubmitTimeout = setTimeout(() => this.autoSubmit(), 200)
  }

  // This fixes an issue in Firefox and ActiveStorage, where uploads would be a blank string if a file wasn't chosen
  getBlankInputName () {
    const value = dig(this.props.inputRef || this.inputRef, "current", "value")

    if (this.props.type == "file" && value == "")
      return true
  }

  inputName () {
    if (this.state.blankInputName)
      return ""

    return this.props.name
  }
}

export default inputWrapper(ApiMakerInput)
