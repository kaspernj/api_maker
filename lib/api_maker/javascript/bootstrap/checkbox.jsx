import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React from "react"

const inflection = require("inflection")

export default class BootstrapCheckbox extends React.Component {
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
    wrapperClassName: PropTypes.string
  })

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

  wrapperClassName() {
    let classNames = ["component-bootstrap-checkbox"]

    if (this.props.wrapperClassName)
      classNames.push(this.props.wrapperClassName)

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
    let classNames = ["form-check-label"]

    if (this.props.labelClassName)
      classNames.push(this.props.labelClassName)

    return classNames.join(" ")
  }
}
