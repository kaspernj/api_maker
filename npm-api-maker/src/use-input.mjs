import {dig, digg, digs} from "diggerize"
import {useCallback, useEffect, useMemo} from "react"
import idForComponent from "./inputs/id-for-component.mjs"
import nameForComponent from "./inputs/name-for-component.mjs"
import strftime from "strftime"
import useEventListener from "./use-event-listener.mjs"
import useShape from "set-state-compare/src/use-shape.js"

const useInput = ({props, wrapperOptions}) => {
  const s = useShape(props)

  s.useStates({
    errors: [],
    form: undefined
  })

  useEffect(() => {
    setForm()
  }, [s.props.inputRef?.current])

  const fakeComponent = useMemo(
    () => ({
      props
    }),
    []
  )

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

  const handleAsCheckbox = useCallback(() => {
    if (s.props.type == "checkbox") return true
    if (!("type" in s.props) && wrapperOptions?.type == "checkbox") return true

    return false
  }, [])

  const handleAsSelect = useCallback(() => {
    if (wrapperOptions?.type == "select") return true

    return false
  }, [])

  const inputDefaultChecked = useCallback(() => {
    if ("defaultChecked" in s.props) {
      return s.props.defaultChecked
    } else if (s.props.model) {
      if (!s.props.model[s.props.attribute])
        throw new Error(`No such attribute: ${s.props.attribute}`)

      return s.props.model[s.props.attribute]()
    }
  }, [])

  const inputDefaultValue = useCallback(() => {
    if ("defaultValue" in s.props) {
      return formatValue(s.props.defaultValue)
    } else if (s.props.model) {
      if (!s.props.model[s.props.attribute]) {
        throw new Error(`No such attribute defined on resource: ${digg(s.props.model.modelClassData(), "name")}#${s.props.attribute}`)
      }

      return formatValue(s.props.model[s.props.attribute]())
    }
  }, [])

  const inputName = useCallback(() => {
    if (s.state.blankInputName) return ""

    return getName()
  }, [])

  const inputRefBackup = useCallback(() => {
    if (!s.meta._inputRefBackup) s.meta._inputRefBackup = React.createRef()

    return s.meta._inputRefBackup
  }, [])

  const inputRef = useCallback(() => s.props.inputRef || inputRefBackup())

  const inputType = useCallback(() => {
    if ("type" in s.props) {
      return s.props.type
    } else if (wrapperOptions?.type == "checkbox") {
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

  const onValidationErrors = useCallback((event) => {
    const errors = event.detail.getValidationErrorsForInput({
      attribute: s.props.attribute,
      inputName: inputName(),
      onMatchValidationError: s.props.onMatchValidationError
    })

    s.set({errors})
  }, [])

  const setForm = useCallback(() => {
    const inputElement = inputRef().current

    let form

    if (inputElement) form = dig(inputElement, "form")
    if (form && form != s.s.form) s.set({form})
  }, [])

  const getId = useCallback(() => idForComponent(fakeComponent), [])
  const getName = useCallback(() => nameForComponent(fakeComponent), [])

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

    if (handleAsCheckbox()) {
      if ("checked" in s.props) {
        inputProps.checked = s.props.checked
      }

      if ("defaultChecked" in s.props || (s.props.attribute && s.props.model)) {
        inputProps.defaultChecked = inputDefaultChecked()
      }
    } else {
      inputProps.defaultValue = inputDefaultValue()
    }

    return inputProps
  }, [])

  const {inputProps: oldInputProps, ...restProps} = props
  const type = inputType()
  const inputProps = getInputProps()

  if (!inputProps.ref) throw new Error("No input ref?")
  if (!handleAsSelect()) inputProps.type = type

  const wrapperOpts = {
    errors: s.s.errors,
    form: s.s.form,
    label: label()
  }

  useEventListener(s.s.form, "validation-errors", onValidationErrors)

  return {
    inputProps,
    wrapperOpts,
    restProps
  }
}

export default useInput
