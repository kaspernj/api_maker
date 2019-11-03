import MoneyInput from "./money-input"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React from "react"

const inflection = require("inflection")

export default class BootstrapStringInput extends React.Component {
  static propTypes = PropTypesExact({
    append: PropTypes.node,
    attribute: PropTypes.string,
    autoComplete: PropTypes.bool,
    className: PropTypes.string,
    currenciesCollection: PropTypes.array,
    currencyName: PropTypes.string,
    "data-controller": PropTypes.string,
    defaultValue: PropTypes.node,
    disabled: PropTypes.bool,
    hint: PropTypes.node,
    hintBottom: PropTypes.node,
    id: PropTypes.string,
    label: PropTypes.node,
    labelClassName: PropTypes.string,
    maxLength: PropTypes.number,
    model: PropTypes.object,
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

  render() {
    return (
      <div className={this.wrapperClassName()} ref="wrapper">
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
              autoComplete={this.props.autoComplete}
              className={this.inputClassName()}
              data-controller={this.props["data-controller"]}
              defaultValue={this.inputDefaultValue()}
              disabled={this.props.disabled}
              id={this.inputId()}
              name={this.inputName()}
              onChange={this.props.onChange}
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
    var classNames = ["form-control"]

    if (this.props.className)
      classNames.push(this.props.className)

    return classNames.join(" ")
  }

  inputDefaultValue() {
    if ("defaultValue" in this.props) {
      return this.formatValue(this.props.defaultValue)
    } else if (this.props.model) {
      if (!this.props.model[this.props.attribute])
        throw new Error(`No such attribute: ${this.props.attribute}`)

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
    var classNames = []

    if (this.props.labelClassName)
      classNames.push(this.props.labelClassName)

    return classNames.join(" ")
  }

  wrapperClassName() {
    var classNames = ["form-group", "component-bootstrap-string-input"]

    if (this.props.wrapperClassName)
      classNames.push(this.props.wrapperClassName)

    return classNames.join(" ")
  }
}
