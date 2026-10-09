// @ts-check
/* eslint-disable sort-imports */
import React, {useRef} from "react"
import {digg} from "diggerize"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import AutoSubmit from "./auto-submit.js"
import PropTypes from "prop-types"
import applyFormFieldValue from "./apply-form-field-value.js"
import memo from "set-state-compare/build/memo.js"
import useInput from "../use-input.js"
import useUpdatedEvent from "../use-updated-event.js"

/**
 * @typedef {object} Props
 * @property {string} [attribute]
 * @property {boolean} [autoRefresh]
 * @property {boolean} [autoSubmit]
 * @property {boolean} [defaultChecked]
 * @property {boolean | number | string} [defaultValue]
 * @property {string} [id]
 * @property {object} [inputRef]
 * @property {object} [model]
 * @property {string} [name]
 * @property {Function} [onErrors]
 * @property {Function} [onMatchValidationError]
 * @property {boolean} [zeroInput]
 */
/** @typedef {Record<string, never>} State */
export default memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class ApiMakerInputsCheckbox extends ShapeComponent {
  static defaultProps = {
    autoRefresh: false,
    autoSubmit: false,
    defaultValue: 1,
    model: null,
    zeroInput: true
  }

  static propTypes = {
    attribute: PropTypes.string,
    autoRefresh: PropTypes.bool,
    autoSubmit: PropTypes.bool,
    defaultChecked: PropTypes.bool,
    defaultValue: PropTypes.any,
    id: PropTypes.string,
    inputRef: PropTypes.object,
    model: PropTypes.object,
    name: PropTypes.string,
    onErrors: PropTypes.func,
    onMatchValidationError: PropTypes.func,
    zeroInput: PropTypes.bool
  }

  setup() {
    const {autoRefresh, model} = this.p
    const {fieldRegistration, form, inputProps, restProps: useInputRestProps} = useInput({props: this.props, wrapperOptions: {type: "checkbox"}})

    this.fieldRegistration = fieldRegistration
    this.form = form
    this.inputProps = inputProps
    this.lastSyncedValueRef = useRef(undefined)
    this.useInputRestProps = useInputRestProps

    useUpdatedEvent(model, this.tt.onModelUpdated, {active: Boolean(autoRefresh && model)})
  }

  componentDidMount() {
    // Track the value in the same representation as the checkbox (its checked
    // state) so the edited-field guard in onModelUpdated compares like with like.
    this.lastSyncedValueRef.current = Boolean(this.inputProps.defaultChecked)
  }

  render () {
    const {inputProps, useInputRestProps} = this.tt
    const {
      attribute,
      autoRefresh,
      autoSubmit,
      checked,
      defaultChecked,
      defaultValue,
      id,
      inputRef,
      model,
      name,
      onChange,
      zeroInput,
      ...restProps
    } = useInputRestProps

    return (
      <>
        {zeroInput && inputProps.name &&
          <input defaultValue="0" name={inputProps.name} type="hidden" />
        }
        <input
          {...inputProps}
          data-auto-refresh={autoRefresh}
          data-auto-submit={autoSubmit}
          defaultValue={defaultValue}
          onChange={this.tt.onChanged}
          type="checkbox"
          {...restProps}
        />
      </>
    )
  }

  onChanged = (...args) => {
    const {fieldRegistration, inputProps} = this.tt
    const {attribute, autoSubmit, model, onChange} = this.props
    const {name} = inputProps

    if (attribute && autoSubmit && model) new AutoSubmit({component: this}).autoSubmit()

    if (name) fieldRegistration.setValue(args[0].target.checked)

    if (onChange) onChange(...args)
  }

  onModelUpdated = (args) => {
    const {attribute} = this.p
    const newModel = digg(args, "model")
    const newValue = newModel.readAttribute(attribute)

    const {form, inputProps} = this
    const lastSynced = this.lastSyncedValueRef.current
    const lastSyncedBool = lastSynced === undefined || lastSynced === null ? false : Boolean(lastSynced)

    let currentBool
    if (form && inputProps.name) {
      const currentValue = form.getValue(inputProps.name)
      currentBool = Boolean(currentValue)
    } else {
      const input = digg(inputProps, "ref", "current")
      currentBool = input ? Boolean(input.checked) : false
    }

    // A re-sync that lands after the checkbox has already been toggled would
    // reset the user's choice; keep the user's value.
    if (currentBool !== lastSyncedBool) {
      return
    }

    if (form && inputProps.name) {
      form.setValue(inputProps.name, Boolean(newValue))
    } else {
      const input = digg(inputProps, "ref", "current")

      if (input) applyFormFieldValue(input, newValue, {checkbox: true})
    }

    this.lastSyncedValueRef.current = Boolean(newValue)
  }
}))
