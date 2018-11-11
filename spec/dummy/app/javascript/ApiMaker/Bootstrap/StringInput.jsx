import changeCase from "change-case"
import MoneyInput from "./MoneyInput"
import React from "react"

export default class BootstrapStringInput extends React.Component {
  render() {
    return (
      <div className={this.wrapperClassName()} ref="wrapper">
        {this.label() &&
          <h4>
            <label className={this.labelClassName()} htmlFor={this.inputId()}>{this.label()}</label>
          </h4>
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
            name={this.inputName()}
            onChange={this.props.onChange}
            onKeyUp={this.props.onKeyUp}
            placeholder={this.props.placeholder}
            ref="input"
            />
        }
        {this.inputType() == "money" &&
          <MoneyInput
            attribute={this.props.attribute}
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
              data-month-picker={this.props["data-month-picker"]}
              data-start-date={this.props["data-start-date"]}
              defaultValue={this.inputDefaultValue()}
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
      return this.props.defaultValue
    } else if (this.props.model) {
      if (!this.props.model[this.props.attribute])
        throw `No such attribute: ${this.props.attribute}`

      return this.props.model[this.props.attribute]()
    }
  }

  inputId() {
    if (this.props.id) {
      return this.props.id
    } else if (this.props.model) {
      return `${this.props.model.modelClassData().paramKey}_${changeCase.snakeCase(this.props.attribute)}`
    }
  }

  inputName() {
    if (this.props.name) {
      return this.props.name
    } else if (this.props.model) {
      return `${this.props.model.modelClassData().paramKey}[${changeCase.snakeCase(this.props.attribute)}]`
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
    var classNames = ["font-sm", "bold"]

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
