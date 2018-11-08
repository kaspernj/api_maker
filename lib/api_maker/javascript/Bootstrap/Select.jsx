import changeCase from "change-case"
import React from "react"

export default class BootstrapSelect extends React.Component {
  componentDidMount() {
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

  render() {
    return (
      <div className={this.wrapperClassName()}>
        {this.label() &&
          <h4 className={this.props.labelContainerClassName ? this.props.labelContainerClassName : null}>
            <label className={this.labelClassName()} htmlFor={this.inputId()}>
              {this.label()}
            </label>
          </h4>
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
        <select
          data-controller={this.dataController()}
          data-hide-search={this.props.hideSearch}
          data-placeholder={this.props.placeholder}
          defaultValue={this.inputDefaultValue()}
          className={`form-control ${this.props.className}`}
          id={this.inputId()}
          multiple={this.props.multiple}
          name={this.inputName()}
          onChange={this.props.onChange}
          ref="select"
          >
          {this.includeBlank() &&
            <option></option>
          }
          {this.props.options && this.props.options.map(option => (
            <option key={`select-option-${option[1]}`} value={option[1]}>{option[0]}</option>
          ))}
          {this.props.children}
        </select>
        {this.props.hintBottom &&
          <span className="form-text text-muted font-smoothing font-xs">
            {this.props.hintBottom}
          </span>
        }
      </div>
    )
  }

  dataController() {
    if (this.props["data-controller"]) {
      return this.props["data-controller"]
    } else if (this.props.select2) {
      return "select2--default"
    }
  }

  includeBlank() {
    if (this.props.includeBlank || (this.props.placeholder && !this.props.multiple)) {
      return true
    } else {
      return false
    }
  }

  inputDefaultValue() {
    if (this.props.defaultValue) {
      return this.props.defaultValue
    } else if (this.props.selected) {
      return this.props.selected
    } else if (this.props.model) {
      if (!this.props.model[this.props.attribute])
        throw `No attribute by that name: ${this.props.attribute}`

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

  label() {
    if (this.props.label === false) {
      return null
    } else if (this.props.label) {
      return this.props.label
    } else if (this.props.model) {
      var attributeMethodName = changeCase.camelCase(this.props.attribute.replace(/_id$/, ""))
      return this.props.model.modelClass().humanAttributeName(attributeMethodName)
    }
  }

  labelClassName() {
    var classNames = ["font-sm", "bold", "form-group-label"]

    if (this.props.labelClassName)
      classNames.push(this.props.labelClassName)

    return classNames.join(" ")
  }

  wrapperClassName() {
    var classNames = ["form-group", "component-bootstrap-select"]

    if (this.props.wrapperClassName)
      classNames.push(this.props.wrapperClassName)

    return classNames.join(" ")
  }
}
