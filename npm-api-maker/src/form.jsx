import React, {createContext, useContext, useMemo} from "react"
import BaseComponent from "./base-component"
import FormDataObjectizer from "form-data-objectizer"
import memo from "set-state-compare/src/memo"
import {Platform} from "react-native"
import PropTypes from "prop-types"
import {shapeComponent} from "set-state-compare/src/shape-component"

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

  setValue(name, value) {
    if (!name) throw new Error("'name' is required")

    this.inputs[name] = value
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
  static propTypes = {
    children: PropTypes.node,
    formRef: PropTypes.object,
    onSubmit: PropTypes.func,
    setForm: PropTypes.func
  }

  render() {
    const {children, formRef, onSubmit, setForm, ...restProps} = this.props
    const form = useMemo(() => new FormInputs({onSubmit}), [])

    useMemo(() => {
      if (setForm) {
        setForm(form)
      }
    }, [setForm])

    return (
      <FormContext.Provider value={form}>
        {Platform.OS == "web" &&
          <form ref={formRef} onSubmit={this.tt.onFormSubmit} {...restProps}>
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
