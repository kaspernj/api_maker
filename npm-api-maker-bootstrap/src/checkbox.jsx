import { Checkbox, idForComponent, nameForComponent } from "@kaspernj/api-maker-inputs"
import classNames from "classnames"
import { EventListener } from "@kaspernj/api-maker"
import PropTypes from "prop-types"
import React from "react"

export default class ApiMakerBootstrapCheckbox extends React.Component {
  static defaultProps = {
    defaultValue: 1,
    zeroInput: true
  }
  static propTypes = {
    attribute: PropTypes.string,
    className: PropTypes.string,
    defaultChecked: PropTypes.bool,
    defaultValue: PropTypes.node,
    hint: PropTypes.node,
    id: PropTypes.string,
    label: PropTypes.node,
    labelClassName: PropTypes.string,
    model: PropTypes.object,
    name: PropTypes.string,
    onChange: PropTypes.func,
    onMatchValidationError: PropTypes.func,
    wrapperClassName: PropTypes.string,
    zeroInput: PropTypes.bool
  }

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
    const form = this.refs.checkbox && this.refs.checkbox.refs.input && this.refs.checkbox.refs.input.form
    if (form != this.state.form) this.setState({form})
  }

  render() {
    const { className, hint, id, label, labelClassName, onMatchValidationError, wrapperClassName, ...restProps } = this.props
    const { form, validationErrors } = this.state

    return (
      <div className={this.wrapperClassName()}>
        {form && <EventListener event="validation-errors" onCalled={event => this.onValidationErrors(event)} target={form} />}
        <div className="form-check">
          <Checkbox
            defaultChecked={this.inputDefaultChecked()}
            className={classNames("form-check-input", className)}
            id={this.inputId()}
            name={this.inputName()}
            ref="checkbox"
            {...restProps}
          />

          {this.label() &&
            <label className={this.labelClassName()} htmlFor={this.inputId()}>
              {this.label()}
            </label>
          }
        </div>
        {hint &&
          <p className="text-muted">
            {hint}
          </p>
        }
        {validationErrors.length > 0 && <InvalidFeedback errors={validationErrors} />}
      </div>
    )
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
    return idForComponent(this)
  }

  inputName() {
    return nameForComponent(this)
  }

  onValidationErrors(event) {
    const validationErrors = event.detail.getValidationErrorsForInput({
      attribute: this.props.attribute,
      inputName: this.inputName(),
      onMatchValidationError: this.props.onMatchValidationError
    })

    this.setState({validationErrors})
  }

  label() {
    const { attribute, label, model } = this.props

    if ("label" in this.props) {
      return label
    } else if (attribute && model) {
      return model.modelClass().humanAttributeName(attribute)
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
