// @ts-check
/* eslint-disable sort-imports */
import React, {useMemo} from "react"
import {digg} from "diggerize"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import {useForm} from "../form"
import AutoSubmit from "./auto-submit.js"
import PropTypes from "prop-types"
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
    const {inputProps, restProps: useInputRestProps} = useInput({props: this.props, wrapperOptions: {type: "checkbox"}})
    const {defaultValue, name} = inputProps

    this.form = useForm()
    this.inputProps = inputProps
    this.useInputRestProps = useInputRestProps

    useMemo(() => {
      if (name) {
        this.tt.form?.setValue(name, defaultValue)
      }
    }, [])

    useUpdatedEvent(model, this.tt.onModelUpdated, {active: Boolean(autoRefresh && model)})
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
    const {form, inputProps} = this.tt
    const {attribute, autoSubmit, model, onChange} = this.props
    const {name} = inputProps

    if (attribute && autoSubmit && model) new AutoSubmit({component: this}).autoSubmit()

    if (form && name) {
      const checked = args[0].target.checked

      form.setValue(name, checked)
    }

    if (onChange) onChange(...args)
  }

  onModelUpdated = (args) => {
    const inputRef = digg(this.tt.inputProps, "ref")

    if (!inputRef.current) {
      // This can happen if the component is being unmounted
      return
    }

    const {attribute} = this.p
    const newModel = digg(args, "model")
    const currentChecked = digg(inputRef, "current", "checked")
    const newValue = newModel.readAttribute(attribute)

    if (currentChecked != newValue) {
      inputRef.current.checked = newValue
    }
  }
}))
