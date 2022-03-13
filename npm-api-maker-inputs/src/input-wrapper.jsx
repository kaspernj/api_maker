const classNames = require("classnames")
const {digs} = require("diggerize")
const {EventListener} = require("@kaspernj/api-maker")
const React = require("react")
const idForComponent = require("./id-for-component.cjs")
const nameForComponent = require("./name-for-component.cjs")
const {parentElement} = require("./parent-element.cjs")
const strftime = require("strftime")

const inputWrapper = (WrapperComponentClass) => {
  return class ApiMakerInputWrapper extends React.PureComponent {
    rootElementRef = React.createRef()

    state = {
      errors: [],
      form: undefined
    }

    componentDidMount() {
      if (this.props.onErrors) {
        this.setForm()
      }
    }

    componentDidUpdate() {
      if (this.props.onErrors) {
        this.setForm()
      }
    }

    render() {
      const {className, ...restProps} = this.props
      const {errors, form} = digs(this.state, "errors", "form")

      return (
        <>
          {form &&
            <EventListener event="validation-errors" onCalled={digg(this, "onValidationErrors")} target={form} />
          }
          <div className="api-maker-inputs-input-wrapper" ref={digg(this, "rootElementRef")} />
          <WrapperComponentClass
            className={classNames("api-maker-inputs-wrapper", className)}
            defaultValue={this.inputDefaultValue()}
            errors={errors}
            id={idForComponent(this)}
            label={this.label()}
            name={nameForComponent(this)}
            type={this.inputType()}
            {...restProps}
          />
        </>
      )
    }

    formatValue (value) {
      const {formatValue} = this.props

      if (formatValue) {
        return formatValue(value)
      } else if (value instanceof Date && !isNaN(value.getTime())) {
        // We need to use a certain format for datetime-local
        if (this.inputType() == "datetime-local") {
          return strftime("%Y-%m-%dT%H:%M:%S", value)
        } else if (this.inputType() == "date") {
          return strftime("%Y-%m-%d", value)
        }
      }

      return value
    }

    inputDefaultValue () {
      if ("defaultValue" in this.props) {
        return this.formatValue(this.props.defaultValue)
      } else if (this.props.model) {
        if (!this.props.model[this.props.attribute]) {
          throw new Error(`No such attribute: ${digg(this.props.model.modelClassData(), "name")}#${this.props.attribute}`)
        }

        return this.formatValue(this.props.model[this.props.attribute]())
      }
    }

    inputName () {
      if (this.state.blankInputName)
        return ""

      return nameForComponent(this)
    }

    inputType() {
      if (this.props.type) {
        return this.props.type
      } else {
        return "text"
      }
    }

    label() {
      if ("label" in this.props) {
        return this.props.label
      } else if (this.props.model) {
        return this.props.model.modelClass().humanAttributeName(this.props.attribute)
      }
    }

    onValidationErrors = (event) => {
      const errors = event.detail.getValidationErrorsForInput({
        attribute: this.props.attribute,
        inputName: this.inputName(),
        onMatchValidationError: this.props.onMatchValidationError
      })

      this.setState({errors})
    }

    setForm () {
      const rootElement = digg(this, "rootElementRef", "current")

      let form

      if (rootElement) {
        form = parentElement({element: rootElement, callback: (element) => element.tagName == "SPAN"})
      }

      if (form != this.state.form) {
        this.setState({form})
      }
    }
  }
}

export default inputWrapper
