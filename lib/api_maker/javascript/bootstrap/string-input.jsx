import EventListener from "api-maker/event-listener"
import InvalidFeedback from "./invalid-feedback"
import MoneyInput from "./money-input"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React from "react"

const inflection = require("inflection")

export default class BootstrapStringInput extends React.Component {
  static propTypes = PropTypesExact({
    accept: PropTypes.string,
    append: PropTypes.node,
    attribute: PropTypes.string,
    autoComplete: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    className: PropTypes.string,
    currenciesCollection: PropTypes.array,
    currencyName: PropTypes.string,
    "data-controller": PropTypes.string,
    defaultValue: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.node]),
    disabled: PropTypes.bool,
    hint: PropTypes.node,
    hintBottom: PropTypes.node,
    id: PropTypes.string,
    label: PropTypes.node,
    labelClassName: PropTypes.string,
    maxLength: PropTypes.number,
    model: PropTypes.object,
    multiple: PropTypes.bool,
    name: PropTypes.string,
    onChange: PropTypes.func,
    onKeyUp: PropTypes.func,
    placeholder: PropTypes.node,
    rows: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    step: PropTypes.number,
    small: PropTypes.bool,
    type: PropTypes.string,
    wrapperClassName: PropTypes.string
  })

  constructor(props) {
    super(props)
    this.state = {
      blankInputName: this.props.type == "file",
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
    const { form, validationErrors } = this.state

    return (
      <div className={this.wrapperClassName()} ref="wrapper">
        {form && <EventListener event="validation-errors" onCalled={event => this.onValidationErrors(event)} target={form} />}
        {this.label() &&
          <label className={this.labelClassName()} htmlFor={this.inputId()}>
            {this.label()}
          </label>
        }
        {this.props.hint &&
          <span className="form-text text-muted font-smoothing font-xs">
            {this.props.hint}
          </span>
        }
        {this.inputType() == "textarea" &&
          <textarea
            className={this.inputClassName()}
            data-controller={this.props["data-controller"]}
            defaultValue={this.inputDefaultValue()}
            disabled={this.props.disabled}
            id={this.inputId()}
            maxLength={this.props.maxLength}
            name={this.inputName()}
            onChange={this.props.onChange}
            onKeyUp={this.props.onKeyUp}
            placeholder={this.props.placeholder}
            ref="input"
            rows={this.props.rows}
            />
        }
        {this.inputType() == "money" &&
          <MoneyInput
            attribute={this.props.attribute}
            currenciesCollection={this.props.currenciesCollection}
            currencyName={this.props.currencyName}
            model={this.props.model}
            name={this.props.name}
            className={this.inputClassName()}
            onChange={this.props.onChange}
            placeholder={this.props.placeholder}
            small={this.props.small}
            ref="money"
            />
        }
        {this.inputType() != "textarea" && this.inputType() != "money" &&
          <div className="input-group">
            {this.props.prepend &&
              <div className="input-group-prepend">
                <span className="input-group-text">
                  {this.props.prepend}
                </span>
              </div>
            }
            <input
              accept={this.props.accept}
              autoComplete={this.props.autoComplete}
              className={this.inputClassName()}
              data-controller={this.props["data-controller"]}
              defaultValue={this.inputDefaultValue()}
              disabled={this.props.disabled}
              id={this.inputId()}
              multiple={this.props.multiple}
              name={this.inputName()}
              onChange={e => this.onInputChanged(e)}
              onKeyUp={this.props.onKeyUp}
              placeholder={this.props.placeholder}
              ref="input"
              step={this.props.step}
              type={this.inputType()}
              />
            {this.props.append &&
              <div className="input-group-append">
                <span className="input-group-text">
                  {this.props.append}
                </span>
              </div>
            }
            {validationErrors.length > 0 && <InvalidFeedback errors={validationErrors} />}
          </div>
        }
        {this.props.hintBottom &&
          <span className="form-text text-muted font-smoothing font-xs">
            {this.props.hintBottom}
          </span>
        }
      </div>
    )
  }

  inputClassName() {
    const classNames = ["form-control"]

    if (this.props.className)
      classNames.push(this.props.className)

    if (this.state.validationErrors.length > 0)
      classNames.push("is-invalid")

    return classNames.join(" ")
  }

  inputDefaultValue() {
    if ("defaultValue" in this.props) {
      return this.formatValue(this.props.defaultValue)
    } else if (this.props.model) {
      if (!this.props.model[this.props.attribute])
        throw new Error(`No such attribute: ${this.props.model.modelClassData().name}#${this.props.attribute}`)

      return this.formatValue(this.props.model[this.props.attribute]())
    }
  }

  formatValue(value) {
    // We need to use a certain format for datetime-local
    if (this.inputType() == "datetime-local" && value instanceof Date) {
      return I18n.strftime(value, "%Y-%m-%dT%H:%M:%S")
    } else if (this.inputType() == "date" && value instanceof Date) {
      return I18n.strftime(value, "%Y-%m-%d")
    }

    return value
  }

  inputId() {
    if ("id" in this.props) {
      return this.props.id
    } else if (this.props.model) {
      return `${this.props.model.modelClassData().paramKey}_${inflection.underscore(this.props.attribute)}`
    }
  }

  inputName() {
    if (this.state.blankInputName)
      return ""

    if ("name" in this.props) {
      return this.props.name
    } else if (this.props.model) {
      return `${this.props.model.modelClassData().paramKey}[${inflection.underscore(this.props.attribute)}]`
    }
  }

  inputType() {
    if (this.props.type) {
      return this.props.type
    } else {
      return "text"
    }
  }

  label() {
    if (this.props.label === false) {
      return null
    } else if (this.props.label) {
      return this.props.label
    } else if (this.props.model) {
      return this.props.model.modelClass().humanAttributeName(this.props.attribute)
    }
  }

  labelClassName() {
    const classNames = []

    if (this.props.labelClassName)
      classNames.push(this.props.labelClassName)

    return classNames.join(" ")
  }

  onInputChanged(e) {
    const { onChange, type } = this.props

    if (type == "file") this.setState({blankInputName: this.getBlankInputName()})
    if (onChange) onChange(e)
  }

  // This fixes an issue in Firefox and ActiveStorage, where uploads would be a blank string if a file wasn't chosen
  getBlankInputName() {
    const value = this.refs.input.value
    return (this.props.type == "file" && value == "")
  }

  onValidationErrors(event) {
    const validationErrors = event.detail.getValidationErrorsForInput(this.props.attribute, this.inputName())
    this.setState({validationErrors})
  }

  wrapperClassName() {
    const classNames = ["form-group", "component-bootstrap-string-input"]

    if (this.props.wrapperClassName)
      classNames.push(this.props.wrapperClassName)

    return classNames.join(" ")
  }
}
