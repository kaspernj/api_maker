import AutoSubmit from "./auto-submit"
import BaseComponent from "../base-component"
import {dig, digg, digs} from "diggerize"
import inputWrapper from "./input-wrapper"
import memo from "set-state-compare/src/memo"
import Money from "./money"
import PropTypes from "prop-types"
import React, {useMemo, useRef} from "react"
import replaceall from "replaceall"
import {shapeComponent} from "set-state-compare/src/shape-component"
import strftime from "strftime"
import {useForm} from "../form"
import useI18n from "i18n-on-steroids/src/use-i18n"
import useUpdatedEvent from "../use-updated-event"

const ApiMakerInputsInput = memo(shapeComponent(class ApiMakerInputsInput extends BaseComponent {
  static defaultProps = {
    autoRefresh: false,
    autoSubmit: false,
    model: null,
    localizedNumber: false
  }

  static propTypes = {
    attribute: PropTypes.string,
    autoRefresh: PropTypes.bool.isRequired,
    autoSubmit: PropTypes.bool.isRequired,
    className: PropTypes.string,
    formatValue: PropTypes.func,
    id: PropTypes.string,
    localizedNumber: PropTypes.bool.isRequired,
    model: PropTypes.object,
    name: PropTypes.string,
    onChange: PropTypes.func,
    onMatchValidationError: PropTypes.func,
    type: PropTypes.string
  }

  setup() {
    const {t} = useI18n({namespace: "js.api_maker.inputs.input"})
    const {autoRefresh, inputProps, model} = this.p
    const {defaultValue, name} = inputProps

    this.form = useForm()
    this.visibleInputRef = useRef()
    this.t = t

    this.useStates({
      blankInputName: digg(inputProps, "type") == "file"
    })

    useMemo(() => {
      if (name) {
        this.tt.form?.setValue(name, defaultValue)
      }
    }, [])

    useUpdatedEvent(model, this.tt.onModelUpdated, {active: Boolean(autoRefresh && model)})
  }

  render () {
    const {
      attribute,
      autoRefresh,
      autoSubmit,
      defaultValue,
      formatValue,
      id,
      inputProps,
      inputRef,
      localizedNumber,
      model,
      name,
      onChange,
      onErrors,
      onMatchValidationError,
      type,
      wrapperOpts,
      ...restProps
    } = this.props

    const sharedProps = {
      id: localizedNumber ? null : inputProps.id,
      name: localizedNumber ? null : inputProps.name,
    }
    const ref = localizedNumber ? this.visibleInputRef : this.inputReference()
    const {ref: inputPropsRef, ...inputPropsWithoutRef} = inputProps

    return (
      <>
        {localizedNumber &&
          <input
            defaultValue={defaultValue}
            id={inputProps.id}
            name={this.inputName()}
            ref={this.inputReference()}
            type="hidden"
          />
        }
        {type == "money" &&
          <Money
            attribute={attribute}
            defaultValue={this.inputDefaultValueLocalized()}
            inputRef={this.inputReference()}
            model={model}
            onChange={this.onInputChanged}
            {...inputPropsWithoutRef}
            {...sharedProps}
            {...restProps}
          />
        }
        {type == "textarea" &&
          <textarea
            defaultValue={this.inputDefaultValueLocalized()}
            onChange={this.onInputChanged}
            ref={ref}
            {...inputPropsWithoutRef}
            {...sharedProps}
            {...restProps}
          />
        }
        {type != "money" && type != "textarea" &&
          <input
            defaultValue={this.inputDefaultValueLocalized()}
            onChange={this.onInputChanged}
            ref={ref}
            {...inputPropsWithoutRef}
            {...sharedProps}
            name={localizedNumber ? null : this.inputName()}
            {...restProps}
          />
        }
      </>
    )
  }

  actualValue (visibleInput) {
    const {t} = this.tt
    const {localizedNumber} = digs(this.props, "localizedNumber")
    const value = digg(visibleInput, "value")

    if (localizedNumber) {
      const decimal = t("number.currency.format.separator")
      const integerSeparator = t("number.currency.format.delimiter")

      let unformatted = replaceall(integerSeparator, "", value)

      unformatted = replaceall(decimal, ".", unformatted)

      return unformatted
    }

    return value
  }

  autoSubmit = () => new AutoSubmit({component: this}).autoSubmit()

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
    const {t} = this.tt
    const {defaultValue} = this.props
    const {localizedNumber} = digs(this.props, "localizedNumber")

    if (localizedNumber && defaultValue !== null && defaultValue !== undefined) {
      const separator = t("number.currency.format.separator")
      const delimiter = t("number.currency.format.delimiter")

      let formatted = `${defaultValue}`

      formatted = replaceall(".", "{{separator}}", formatted)
      formatted = replaceall(",", "{{delimiter}}", formatted)
      formatted = replaceall("{{separator}}", separator, formatted)
      formatted = replaceall("{{delimiter}}", delimiter, formatted)

      return formatted
    }

    return defaultValue
  }

  inputName () {
    if (this.state.blankInputName) return ""

    return this.props.inputProps.name
  }

  inputReference = () => digg(this, "props", "inputProps", "ref")

  onModelUpdated = (args) => {
    const inputRef = this.inputReference()

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
    const {form} = this.tt
    const {attribute, autoSubmit, inputProps, model, onChange} = this.props
    const {localizedNumber} = digs(this.props, "localizedNumber")
    const {name} = inputProps

    if (localizedNumber) this.inputReference().current.value = this.actualValue(digg(e, "target"))

    if (attribute && autoSubmit && model) this.delayAutoSubmit()
    if (digg(inputProps, "type") == "file") this.setState({blankInputName: this.getBlankInputName()})

    if (form && name) {
      form.setValue(name, e.target.value)
    }

    if (onChange) onChange(e)
  }

  delayAutoSubmit () {
    if (this.delayAutoSubmitTimeout) {
      clearTimeout(this.delayAutoSubmitTimeout)
    }

    this.delayAutoSubmitTimeout = setTimeout(this.autoSubmit, 200)
  }

  // This fixes an issue in Firefox and ActiveStorage, where uploads would be a blank string if a file wasn't chosen
  getBlankInputName () {
    const value = dig(this.inputReference(), "current", "value")

    if (this.props.inputProps.type == "file" && value == "")
      return true
  }
}))

export {ApiMakerInputsInput as Input}
export default inputWrapper(ApiMakerInputsInput)
