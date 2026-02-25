/* eslint-disable sort-imports */
import React, {createContext, useContext, useEffect, useMemo} from "react"
import {Platform} from "react-native"
import {shapeComponent} from "set-state-compare/build/shape-component.js"
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
    setForm: PropTypes.func
  })

  render() {
    const {children, form: givenForm, formObjectRef, formRef, htmlFormProps, onSubmit, setForm} = this.props
    const localForm = useMemo(() => new FormInputs({onSubmit}), [])
    const form = givenForm || localForm

    form.onSubmit = onSubmit

    useMemo(() => {
      if (formObjectRef) {
        formObjectRef.current = form
      }
    }, [form, formObjectRef])

    useEffect(() => () => {
      if (formObjectRef) {
        formObjectRef.current = null
      }
    }, [form, formObjectRef])

    useMemo(() => {
      if (setForm) {
        setForm(form)
      }
    }, [form, setForm])

    return (
      <FormContext.Provider value={form}>
        {Platform.OS == "web" &&
          <form {...htmlFormProps} onSubmit={this.tt.onFormSubmit} ref={formRef}>
            {children}
          </form>
        }
        {Platform.OS != "web" && this.props.children}
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
