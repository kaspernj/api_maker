import EventListener from "api-maker/event-listener"
import InvalidFeedback from "./invalid-feedback"
import InputSelect from "api-maker/inputs/select"
import PropTypes from "prop-types"
import React from "react"

const inflection = require("inflection")

export default class BootstrapSelect extends React.Component {
  static propTypes = {
    attribute: PropTypes.string,
    children: PropTypes.node,
    className: PropTypes.string,
    "data-controller": PropTypes.string,
    defaultValue: PropTypes.oneOfType([PropTypes.array, PropTypes.number, PropTypes.string]),
    description: PropTypes.node,
    id: PropTypes.string,
    hint: PropTypes.node,
    hintBottom: PropTypes.node,
    label: PropTypes.node,
    labelContainerClassName: PropTypes.string,
    model: PropTypes.object,
    name: PropTypes.string,
    select2: PropTypes.bool,
    wrapperClassName: PropTypes.string
  }

  constructor(props) {
    super(props)
    this.state = {
      validationErrors: []
    }
  }

  componentDidMount() {
    this.setForm()

    if (this.props.select2 && this.props.onChange)
      $(this.refs.select).on("change", this.props.onChange)

    // Set default value to nothing when multiple
    if (this.props.select2 && this.props.multiple && !this.inputDefaultValue())
      $(this.refs.select).val("")
  }

  componentWillUnmount() {
    if (this.props.select2 && this.props.onChange)
      $(this.refs.select).off("change", this.props.onChange)
  }

  componentDidUpdate() {
    this.setForm()
  }

  setForm() {
    const form = this.refs.select && this.refs.select.form
    if (form != this.state.form) this.setState({form})
  }

  render() {
    const {
      attribute,
      className,
      defaultValue,
      description,
      id,
      hint,
      hintBottom,
      label,
      labelContainerClassname,
      model,
      name,
      select2,
      wrapperClassName,
      ...restProps
    } = this.props
    const { form, validationErrors } = this.state

    return (
      <div className={this.wrapperClassName()}>
        {form && <EventListener event="validation-errors" onCalled={event => this.onValidationErrors(event)} target={form} />}
        {this.label() &&
          <div className={this.props.labelContainerClassName ? this.props.labelContainerClassName : null}>
            <label className={this.labelClassName()} htmlFor={this.inputId()}>
              {this.label()}
            </label>
          </div>
        }
        {this.props.description &&
          <div className="mb-4">
            {this.props.description}
          </div>
        }
        {this.props.hint &&
          <span className="form-text text-muted font-smoothing font-xs">
            {this.props.hint}
          </span>
        }
        <InputSelect
          {...restProps}
          data-controller={this.dataController()}
          className={this.selectClassName()}
          id={this.inputId()}
          name={this.inputName()}
          ref="select"
        />
        {this.props.hintBottom &&
          <span className="form-text text-muted font-smoothing font-xs">
            {this.props.hintBottom}
          </span>
        }
        {validationErrors.length > 0 && <InvalidFeedback errors={validationErrors} />}
      </div>
    )
  }

  dataController() {
    if ("data-controller" in this.props) {
      return this.props["data-controller"]
    } else if (this.props.select2) {
      return "select2--default"
    }
  }

  inputId() {
    if ("id" in this.props) {
      return this.props.id
    } else if (this.props.model) {
      return `${this.props.model.modelClassData().paramKey}_${inflection.underscore(this.props.attribute)}`
    }
  }

  inputName() {
    if ("name" in this.props) {
      return this.props.name
    } else if (this.props.model) {
      return `${this.props.model.modelClassData().paramKey}[${inflection.underscore(this.props.attribute)}]`
    }
  }

  label() {
    if ("label" in this.props) {
      return this.props.label
    } else if (this.props.model) {
      const attributeMethodName = inflection.camelize(this.props.attribute.replace(/_id$/, ""), true)
      return this.props.model.modelClass().humanAttributeName(attributeMethodName)
    }
  }

  labelClassName() {
    const classNames = ["form-group-label"]

    if (this.props.labelClassName)
      classNames.push(this.props.labelClassName)

    return classNames.join(" ")
  }

  onValidationErrors(event) {
    const validationErrors = event.detail.getValidationErrorsForInput(this.props.attribute, this.inputName())
    this.setState({validationErrors})
  }

  selectClassName() {
    const classNames = ["form-control"]

    if (this.props.className) classNames.push(this.props.className)

    if (this.state.validationErrors.length > 0)
      classNames.push("is-invalid")

    return classNames.join(" ")
  }

  wrapperClassName() {
    const classNames = ["form-group", "component-bootstrap-select"]

    if (this.props.wrapperClassName)
      classNames.push(this.props.wrapperClassName)

    return classNames.join(" ")
  }
}
