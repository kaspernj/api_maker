import EventListener from "api-maker/event-listener"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React from "react"

const inflection = require("inflection")

export default class BootstrapCheckbox extends React.Component {
  static defaultProps = {
    defaultValue: 1,
    zeroInput: true
  }
  static propTypes = PropTypesExact({
    attribute: PropTypes.string,
    className: PropTypes.string,
    "data-action": PropTypes.string,
    "data-target": PropTypes.string,
    defaultChecked: PropTypes.bool,
    defaultValue: PropTypes.node,
    hint: PropTypes.node,
    id: PropTypes.string,
    label: PropTypes.node,
    labelClassName: PropTypes.string,
    model: PropTypes.object,
    name: PropTypes.string,
    onChange: PropTypes.func,
    wrapperClassName: PropTypes.string,
    zeroInput: PropTypes.bool
  })

  constructor(props) {
    super(props)
    this.state = {
      validationErrors: []
    }
  }

  componentDidMount() {
    this.setForm()
  }

  componentDidUpdate() {
    this.setForm()
  }

  setForm() {
    const form = this.refs.input && this.refs.input.form
    if (form != this.state.form) this.setState({form})
  }

  render() {
    const { defaultValue, zeroInput } = this.props
    const { form, validationErrors } = this.state
    const id = this.inputId()

    return (
      <div className={this.wrapperClassName()}>
        {form && <EventListener event="validation-errors" onCalled={event => this.onValidationErrors(event)} target={form} />}
        <div className="form-check">
          {zeroInput &&
            <input defaultValue="0" name={this.inputName()} type="hidden" type="hidden" />
          }
          <input
            data-target={this.props["data-target"]}
            defaultChecked={this.inputDefaultChecked()}
            className={this.className()}
            data-action={this.props["data-action"]}
            defaultValue={defaultValue}
            id={id}
            name={this.inputName()}
            onChange={this.props.onChange}
            ref="input"
            type="checkbox"
            />

          {this.label() &&
            <label className={this.labelClassName()} htmlFor={id}>
              {this.label()}
            </label>
          }
        </div>
        {this.props.hint &&
          <p className="text-muted">
            {this.props.hint}
          </p>
        }
        {validationErrors.length > 0 && <InvalidFeedback errors={validationErrors} />}
      </div>
    )
  }

  className() {
    const classNames = ["form-check-input"]

    if (this.props.className)
      classNames.push(this.props.className)

    return classNames.join(" ")
  }

  generatedId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  inputDefaultChecked() {
    if ("defaultChecked" in this.props) {
      return this.props.defaultChecked
    } else if (this.props.model) {
      if (!this.props.model[this.props.attribute])
        throw new Error(`No such attribute: ${this.props.attribute}`)

      return this.props.model[this.props.attribute]()
    }
  }

  inputId() {
    if (this.props.id) {
      return this.props.id
    } else if (this.props.model) {
      return `${this.props.model.modelClassData().paramKey}_${inflection.underscore(this.props.attribute)}`
    } else {
      return this.generatedId()
    }
  }

  inputName() {
    if (this.props.name) {
      return this.props.name
    } else if (this.props.model) {
      return `${this.props.model.modelClassData().paramKey}[${inflection.underscore(this.props.attribute)}]`
    }
  }

  onValidationErrors(event) {
    const validationErrors = event.detail.getValidationErrorsForInput(this.props.attribute, this.inputName())
    this.setState({validationErrors})
  }

  label() {
    if ("label" in this.props) {
      return this.props.label
    } else if (this.props.model) {
      return this.props.model.modelClass().humanAttributeName(this.props.attribute)
    }
  }

  labelClassName() {
    const classNames = ["form-check-label"]

    if (this.props.labelClassName)
      classNames.push(this.props.labelClassName)

    return classNames.join(" ")
  }

  wrapperClassName() {
    const classNames = ["component-bootstrap-checkbox"]

    if (this.props.wrapperClassName)
      classNames.push(this.props.wrapperClassName)

    return classNames.join(" ")
  }
}
