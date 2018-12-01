import changeCase from "change-case"
import React from "react"

export default class BootstrapCheckbox extends React.Component {
  render() {
    let id = this.inputId()

    return (
      <div className={this.wrapperClassName()}>
        <div className="form-check">
          <input defaultValue="0" name={this.inputName()} type="hidden" type="hidden" />
          <input
            data-target={this.props["data-target"]}
            defaultChecked={this.inputDefaultChecked()}
            className="form-check-input"
            data-action={this.props["data-action"]}
            defaultValue="1"
            id={id}
            name={this.inputName()}
            onChange={this.props.onChange}
            ref="input"
            type="checkbox"
            />

          {this.label() &&
            <label className={this.labelClassName()} htmlFor={id}>
              {this.props.slider &&
                <span className="mr-2 slider-container"></span>
              }
              {this.label()}
            </label>
          }
        </div>
        {this.props.hint &&
          <p className="text-muted">
            {this.props.hint}
          </p>
        }
      </div>
    )
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
      return `${this.props.model.modelClassData().paramKey}_${changeCase.snakeCase(this.props.attribute)}`
    } else {
      return this.generatedId()
    }
  }

  inputName() {
    if (this.props.name) {
      return this.props.name
    } else if (this.props.model) {
      return `${this.props.model.modelClassData().paramKey}[${changeCase.snakeCase(this.props.attribute)}]`
    }
  }

  wrapperClassName() {
    let classNames = ["component-bootstrap-checkbox"]

    if (this.props.wrapperClassName)
      classNames.push(this.props.wrapperClassName)

    if (this.props.slider)
      classNames.push("component-bootstrap-checkbox-slider")

    return classNames.join(" ")
  }

  label() {
    if (this.props.label) {
      return this.props.label
    } else if (this.props.model) {
      return this.props.model.modelClass().humanAttributeName(this.props.attribute)
    }
  }

  labelClassName() {
    let classNames = ["form-check-label", "text-half-muted", "font-smoothing"]

    if (this.props.labelClassName)
      classNames.push(this.props.labelClassName)

    return classNames.join(" ")
  }
}
