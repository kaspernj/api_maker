/* eslint-disable sort-imports */
import React, {createContext, useContext, useEffect, useMemo} from "react"
import {Platform} from "react-native"
import {shapeComponent} from "set-state-compare/build/shape-component.js"
import apiMakerConfig from "./config.js"
import BaseComponent from "./base-component"
import FormDataObjectizer from "form-data-objectizer"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import memo from "set-state-compare/build/memo.js"

const FormContext = createContext(null)
const useForm = () => useContext(FormContext)

class FormInputs {
  constructor(props) {
    this.inputs = {}
    this.onSubmit = props?.onSubmit
  }

  asObject() {
    const result = {}
    const formDataObjectizer = new FormDataObjectizer()

    for(const key in this.inputs) {
      const value = this.inputs[key]

      formDataObjectizer.treatInitial(key, value, result)
    }

    return result
  }

  getValue(name) {
    return this.inputs[name]
  }

  setValue(name, value) {
    if (!name) throw new Error("'name' is required")

    this.inputs[name] = value
  }

  unsetValue(name) {
    if (!name) throw new Error("'name' is required")

    delete this.inputs[name]
  }

  setValueWithHidden(name, value) {
    this.setValue(name, value)

    if (Platform.OS == "web") {
      return <input name={name} type="hidden" value={value !== null && value !== undefined ? value : ""} />
    }
  }

  submit() {
    if (this.onSubmit) {
      this.onSubmit()
    }
  }
}

const Form = memo(shapeComponent(class Form extends BaseComponent {
  static propTypes = propTypesExact({
    children: PropTypes.any,
    form: PropTypes.instanceOf(FormInputs),
    formObjectRef: PropTypes.object,
    formRef: PropTypes.object,
    htmlFormProps: PropTypes.object,
    onSubmit: PropTypes.func,
    setForm: PropTypes.func,
    useHtmlForm: PropTypes.bool
  })

  render() {
    const {children, form: givenForm, formObjectRef, formRef, htmlFormProps, onSubmit, setForm, useHtmlForm: useHtmlFormProp} = this.props
    const localForm = useMemo(() => new FormInputs({onSubmit}), [])
    const form = givenForm || localForm
    const shouldUseHtmlForm = Platform.OS === "web" && (typeof useHtmlFormProp === "boolean" ? useHtmlFormProp : apiMakerConfig.getUseHtmlForm())

    form.onSubmit = onSubmit

    // Keep form refs/state updates in effects so consumers do not trigger parent updates during render.
    useEffect(() => {
      if (formObjectRef) {
        formObjectRef.current = form
      }
    }, [form, formObjectRef])

    useEffect(() => () => {
      if (formObjectRef) {
        formObjectRef.current = null
      }
    }, [form, formObjectRef])

    // Propagate the stable form instance after commit so ShapeComponent parents stay on the mounted path.
    useEffect(() => {
      if (setForm) {
        setForm(form)
      }
    }, [form, setForm])

    return (
      <FormContext.Provider value={form}>
        {shouldUseHtmlForm &&
          <form {...htmlFormProps} onSubmit={this.tt.onFormSubmit} ref={formRef}>
            {children}
          </form>
        }
        {!shouldUseHtmlForm && children}
      </FormContext.Provider>
    )
  }

  onFormSubmit = (e) => {
    e.preventDefault()

    if (this.props.onSubmit) {
      this.props.onSubmit()
    }
  }
}))

export {Form, FormContext, FormInputs, useForm}
