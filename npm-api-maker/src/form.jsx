import {createContext, memo, useContext, useMemo} from "react"
import BaseComponent from "./base-component"
import FormDataObjectizer from "form-data-objectizer"
import {Platform} from "react-native"
import {shapeComponent} from "set-state-compare/src/shape-component.js"

const FormContext = createContext(null)

class FormInputs {
  constructor() {
    this.inputs = {}
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

    console.log("Form", {name, value})

    this.inputs[name] = value
  }

  setValueWithHidden(name, value) {
    this.setValue(name, value)

    if (Platform.OS == "web") {
      return <input name={name} type="hidden" value={value !== null && value !== undefined ? value : ""} />
    }
  }
}

const Form = memo(shapeComponent(class Form extends BaseComponent {
  render() {
    const {children, setForm, ...restProps} = this.props
    const form = useMemo(() => new FormInputs(), [])

    useMemo(() => {
      if (setForm) {
        setForm(form)
      }
    }, [setForm])

    return (
      <FormContext.Provider value={form}>
        {Platform.OS == "web" &&
          <form {...restProps}>
            {children}
          </form>
        }
        {Platform.OS != "web" && this.props.children}
      </FormContext.Provider>
    )
  }
}))

const useForm = () => useContext(FormContext)

export {Form, FormContext, FormInputs, useForm}
