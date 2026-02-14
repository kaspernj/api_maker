/* eslint-disable implicit-arrow-linebreak, no-extra-parens, no-use-before-define, prefer-object-spread */
import {dig, digg} from "diggerize"
import {useCallback, useEffect, useMemo, useRef} from "react"
import {useForm} from "./form"
import idForComponent from "./inputs/id-for-component.js"
import nameForComponent from "./inputs/name-for-component.js"
import strftime from "strftime"
import useShape from "set-state-compare/build/use-shape.js"
import useValidationErrors from "./use-validation-errors.js"


/**
 * @param {object} args
 * @param {object} args.props
 * @param {object} args.props.inputRef
 * @param {string} args.props.type
 * @param {object} args.props.inputProps
 * @param {string} args.props.inputProps.name
 * @param {object} args.props.inputProps.wrapperOpts
 * @param {object} args.wrapperOptions
 * @param {string} args.wrapperOptions.type
 * @returns {{inputProps: object, wrapperOpts: object, restProps: object}}
 */
const useInput = ({props, wrapperOptions, ...useInputRestProps}) => {
  const useInputRestPropsKeys = Object.keys(useInputRestProps)

  if (useInputRestPropsKeys.length > 0) {
    throw new Error(`Unknown props given to useInput: ${useInputRestPropsKeys.join(", ")}`)
  }

  const s = useShape(props)
  const backupRef = useRef()

  s.useStates({
    form: undefined
  })

  useEffect(() => {
    setForm()
  }, [s.props.inputRef?.current])

  s.meta.fakeComponent = {props}
  s.meta.isCheckbox = props.type == "checkbox" || wrapperOptions?.type == "checkbox"
  s.meta.isSelect = wrapperOptions?.type == "select"

  const formatValue = useCallback((value) => {
    const {formatValue} = s.props

    if (formatValue) {
      return formatValue(value)
    } else if (value instanceof Date && !isNaN(value.getTime())) {
      // We need to use a certain format for datetime-local
      if (inputType() == "datetime-local") {
        return strftime("%Y-%m-%dT%H:%M:%S", value)
      } else if (inputType() == "date") {
        return strftime("%Y-%m-%d", value)
      }
    }

    return value
  }, [])

  const inputDefaultChecked = useCallback(() => {
    if ("defaultChecked" in s.props) {
      return s.props.defaultChecked
    } else if (s.props.attribute && s.props.model) {
      if (!s.props.model[s.props.attribute])
        throw new Error(`No such attribute: ${s.props.attribute}`)

      return s.props.model[s.props.attribute]()
    }
  }, [])

  const inputDefaultValue = useCallback(() => {
    if ("defaultValue" in s.props) {
      return formatValue(s.props.defaultValue)
    } else if (s.props.model && s.props.attribute) {
      if (!s.props.model[s.props.attribute]) {
        throw new Error(`No such attribute defined on resource: ${digg(s.props.model.modelClassData(), "name")}#${s.props.attribute}`)
      }

      return formatValue(s.props.model[s.props.attribute]())
    }
  }, [])

  const inputRef = useCallback(() => s.props.inputRef || backupRef)

  const inputType = useCallback(() => {
    if ("type" in s.props) {
      return s.props.type
    } else if (s.m.isCheckbox) {
      return "checkbox"
    } else {
      return "text"
    }
  }, [])

  const label = useCallback(() => {
    if ("label" in s.props) {
      return s.props.label
    } else if (s.props.attribute && s.props.model) {
      return s.props.model.modelClass().humanAttributeName(s.props.attribute)
    }
  }, [])

  const setForm = useCallback(() => {
    const inputElement = inputRef().current

    let form

    if (inputElement) form = dig(inputElement, "form")
    if (form && form != s.s.form) s.set({form})
  }, [])

  const getId = useCallback(() => idForComponent(s.m.fakeComponent), [])
  const getName = useCallback(() => nameForComponent(s.m.fakeComponent), [])
  const formFromContext = useForm()

  const getInputProps = useCallback(() => {
    const givenInputProps = s.props.inputProps || {}
    const inputProps = Object.assign(
      {
        id: getId(),
        name: getName(),
        ref: inputRef()
      },
      givenInputProps
    )

    if (!s.m.isCheckbox && "value" in s.props && "defaultValue" in s.props) {
      throw new Error("Input cannot receive both value and defaultValue props")
    }

    if (s.m.isCheckbox) {
      if ("checked" in s.props) {
        inputProps.checked = s.props.checked
      }

      if ("defaultChecked" in s.props || (s.props.attribute && s.props.model)) {
        inputProps.defaultChecked = inputDefaultChecked()
      }
    } else if ("value" in s.props) {
      inputProps.value = s.props.value
    } else if (!("value" in s.props)) {
      inputProps.defaultValue = inputDefaultValue()
    }

    return inputProps
  }, [])

  const {inputProps: oldInputProps, wrapperOpts: oldWrapperOpts, ...restProps} = props

  if ("values" in restProps && typeof restProps.values == "undefined") {
    delete restProps.values
  }

  if (
    wrapperOptions?.type == "select" &&
    Array.isArray(restProps.values) &&
    restProps.values.length == 0 &&
    "defaultValue" in restProps &&
    typeof restProps.defaultValue != "undefined"
  ) {
    delete restProps.values
  }
  const type = inputType()

  s.meta.inputProps = getInputProps()
  s.meta.inputNameWithoutId = useMemo(() => s.m.inputProps.name?.replace(/\[(.+)_id\]$/, "[$1]"), [s.m.inputProps.name])

  if (!s.m.inputProps.ref) throw new Error("No input ref?")
  if (!s.m.isSelect) s.m.inputProps.type = type

  const {validationErrors} = useValidationErrors((validationError) =>
    validationError.inputName &&
      s.m.inputProps.name &&
      (validationError.inputName == s.m.inputProps.name || validationError.inputName == s.m.inputNameWithoutId)
  )

  const wrapperOpts = {
    errors: validationErrors,
    form: s.s.form,
    label: label()
  }

  const inputName = s.m.inputProps.name

  useEffect(() => () => {
    if (formFromContext && inputName) {
      formFromContext.unsetValue(inputName)
    }
  }, [formFromContext, inputName])

  return {
    inputProps: s.m.inputProps,
    wrapperOpts,
    restProps
  }
}

export default useInput
