// @ts-check
/* eslint-disable sort-imports */
import React, {useRef} from "react"
import {dig, digg, digs} from "diggerize"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import AutoSubmit from "./auto-submit.js"
import Money from "./money"
import PropTypes from "prop-types"
import applyFormFieldValue from "./apply-form-field-value.js"
import inputWrapper from "./input-wrapper"
import memo from "set-state-compare/build/memo.js"
import replaceall from "replaceall"
import strftime from "strftime"
import useI18n from "i18n-on-steroids/build/src/use-i18n.js"
import useUpdatedEvent from "../use-updated-event.js"

/**
 * @typedef {object} Props
 * @property {string} [attribute]
 * @property {boolean} [autoRefresh]
 * @property {boolean} [autoSubmit]
 * @property {string} [className]
 * @property {(value: boolean | Date | number | string | null | undefined) => boolean | Date | number | string | null | undefined} [formatValue]
 * @property {string} [id]
 * @property {boolean} [localizedNumber]
  * @property {object} [model]
  * @property {string} [name]
  * @property {Function} [onChange]
  * @property {Function} [onMatchValidationError]
  * @property {string} [type]
 */
/**
 * @typedef {object} State
 * @property {boolean} blankInputName
 */
const ApiMakerInputsInput = memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class ApiMakerInputsInput extends ShapeComponent {
  static defaultProps = {
    autoRefresh: false,
    autoSubmit: false,
    localizedNumber: false,
    model: null
  }

  static propTypes = {
    attribute: PropTypes.string,
    autoRefresh: PropTypes.bool,
    autoSubmit: PropTypes.bool,
    className: PropTypes.string,
    formatValue: PropTypes.func,
    id: PropTypes.string,
    localizedNumber: PropTypes.bool,
    model: PropTypes.object,
    name: PropTypes.string,
    onChange: PropTypes.func,
    onMatchValidationError: PropTypes.func,
    type: PropTypes.string
  }

  state = {
    blankInputName: digg(this.props.inputProps, "type") == "file"
  }

  setup() {
    const {t} = useI18n({namespace: "js.api_maker.inputs.input"})
    const {autoRefresh, model} = this.p
    this.fieldRegistration = this.props.fieldRegistration
    this.visibleInputRef = useRef(undefined)
    this.t = t

    useUpdatedEvent(model, this.tt.onModelUpdated, {active: Boolean(autoRefresh && model)})
  }

  render () {
    const {
      attribute,
      autoRefresh,
      autoSubmit,
      defaultValue,
      fieldRegistration,
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
      name: localizedNumber ? null : inputProps.name
    }
    const ref = localizedNumber ? this.visibleInputRef : this.inputReference()
    const inputPropsWithoutRef = {...inputProps}

    delete inputPropsWithoutRef.defaultValue
    delete inputPropsWithoutRef.ref

    return (
      <>
        {localizedNumber &&
          <input
            defaultValue={inputProps.defaultValue}
            id={inputProps.id}
            name={this.inputName()}
            ref={this.tt.setCanonicalInput}
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
    const {defaultValue} = this.props.inputProps
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
    if (this.s.blankInputName) return ""

    return this.props.inputProps.name
  }

  inputReference = () => digg(this, "props", "inputProps", "ref")

  setCanonicalInput = (input) => {
    const inputRef = this.inputReference()

    inputRef.current = input
    if (input) input.applyFormFieldValue = this.tt.applyLocalizedValue
  }

  applyLocalizedValue = (value) => {
    const canonicalInput = this.inputReference().current
    const visibleInput = this.visibleInputRef.current
    const canonicalValue = value === null || value === undefined ? "" : String(value)

    if (canonicalInput) canonicalInput.value = canonicalValue
    if (visibleInput) visibleInput.value = this.localizeNumber(canonicalValue)
  }

  localizeNumber(value) {
    if (value === "") return ""

    const {t} = this.tt
    const separator = t("number.currency.format.separator")
    const delimiter = t("number.currency.format.delimiter")
    let formatted = String(value)

    formatted = replaceall(".", "{{separator}}", formatted)
    formatted = replaceall(",", "{{delimiter}}", formatted)
    formatted = replaceall("{{separator}}", separator, formatted)
    formatted = replaceall("{{delimiter}}", delimiter, formatted)

    return formatted
  }

  onModelUpdated = (args) => {
    const {attribute} = digs(this.props, "attribute")
    const newModel = digg(args, "model")
    const newValue = newModel.readAttribute(attribute)
    const newFormattedValue = this.formatValue(newValue)

    const {form, inputProps} = this.p

    if (form && inputProps.name) {
      form.setValue(inputProps.name, newFormattedValue)
    } else {
      const input = this.inputReference().current

      if (input) applyFormFieldValue(input, newFormattedValue)
    }
  }

  onInputChanged = (e) => {
    const {fieldRegistration} = this.tt
    const {attribute, autoSubmit, inputProps, model, onChange} = this.props
    const {localizedNumber} = digs(this.props, "localizedNumber")
    const {name} = inputProps

    const changedValue = localizedNumber ? this.actualValue(digg(e, "target")) : e.target.value

    if (localizedNumber) this.inputReference().current.value = changedValue

    if (attribute && autoSubmit && model) this.delayAutoSubmit()
    if (digg(inputProps, "type") == "file") this.s.blankInputName = this.getBlankInputName()

    if (name) fieldRegistration.setValue(changedValue)

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
