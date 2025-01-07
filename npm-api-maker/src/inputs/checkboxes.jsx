import BaseComponent from "../base-component"
import classNames from "classnames"
import {digs} from "diggerize"
import inputWrapper from "./input-wrapper"
import * as inflection from "inflection"
import InvalidFeedback from "../bootstrap/invalid-feedback"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import memo from "set-state-compare/src/memo"
import {shapeComponent} from "set-state-compare/src/shape-component"

const ApiMakerInputsCheckboxes = memo(shapeComponent(class ApiMakerInputsCheckboxes extends BaseComponent {
  static propTypes = propTypesExact({
    attribute: PropTypes.string,
    defaultValue: PropTypes.array,
    id: PropTypes.string,
    inputProps: PropTypes.object.isRequired,
    label: PropTypes.node,
    model: PropTypes.object,
    name: PropTypes.string,
    onChange: PropTypes.func,
    options: PropTypes.array.isRequired,
    wrapperOpts: PropTypes.object
  })

  render () {
    const {className, inputProps, label, wrapperOpts, ...restProps} = this.props

    return (
      <div className={classNames("component-bootstrap-check-boxes", className)} {...restProps}>
        <input name={this.inputName()} ref={this.props.inputProps.ref} type="hidden" value="" />
        {this.props.options.map((option, index) => this.optionElement(option, index))}
      </div>
    )
  }

  inputDefaultValue () {
    const {attribute, defaultValue, model} = this.props

    if (defaultValue) {
      return defaultValue
    } else if (attribute && model) {
      if (!model[attribute])
        throw `No such attribute: ${attribute}`

      return this.props.model[attribute]()
    }
  }

  inputCheckboxClassName () {
    const classNames = []

    if (this.props.wrapperOpts.errors.length > 0) classNames.push("is-invalid")

    return classNames.join(" ")
  }

  inputName () {
    if (this.props.name) {
      return `${this.props.name}[]`
    } else if (this.props.model) {
      return `${this.props.model.modelClassData().paramKey}[${inflection.underscore(this.props.attribute)}]`
    }
  }

  isDefaultSelected (option) {
    let defaultValue = this.inputDefaultValue()

    if (!defaultValue) return false

    if (defaultValue.constructor === Array) {
      return defaultValue.includes(option)
    } else {
      return defaultValue == option
    }
  }

  generatedId () {
    if (!this.generatedIdValue)
      this.generatedIdValue = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    return this.generatedIdValue
  }

  optionElement (option, index) {
    const {onChange, options, wrapperOpts} = this.props
    const {errors} = digs(wrapperOpts, "errors")
    const id = `${this.generatedId()}-${index}`

    return (
      <div className="checkboxes-option" key={`option-${option[1]}`}>
        <input
          className={this.inputCheckboxClassName()}
          data-option-value={option[1]}
          defaultChecked={this.isDefaultSelected(option[1])}
          id={id}
          name={this.inputName()}
          onChange={onChange}
          type="checkbox"
          value={option[1]}
        />

        <label className="ml-1" htmlFor={id}>
          {option[0]}
        </label>

        {(index + 1) == options.length && errors.length > 0 &&
          <InvalidFeedback errors={errors} />
        }
      </div>
    )
  }
}))

export default inputWrapper(ApiMakerInputsCheckboxes)
