// @ts-check
import {digs} from "diggerize"
import InvalidFeedback from "./invalid-feedback" // eslint-disable-line sort-imports
import PropTypes from "prop-types"
import React from "react"
import inputWrapper from "../inputs/input-wrapper"
import propTypesExact from "prop-types-exact"

const applyRadioValue = (value, inputRef) => {
  const wrapper = inputRef.current?.parentElement

  if (!wrapper) return

  for (const radio of wrapper.querySelectorAll("input[type=radio]")) {
    radio.checked = radio.dataset.optionValue == value
  }
}

class ApiMakerBootstrapRadioButtons extends React.PureComponent {
  static propTypes = propTypesExact({
    attribute: PropTypes.string,
    collection: PropTypes.array.isRequired,
    defaultValue: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    fieldRegistration: PropTypes.object.isRequired,
    id: PropTypes.string,
    inputProps: PropTypes.object.isRequired,
    name: PropTypes.string,
    model: PropTypes.object,
    onChange: PropTypes.func,
    onMatchValidationError: PropTypes.func,
    value: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    wrapperClassName: PropTypes.string,
    wrapperOpts: PropTypes.object.isRequired
  })

  render () {
    return (
      <div className={this.wrapperClassName()}>
        <input {...this.props.inputProps} defaultValue={undefined} type="hidden" value="" />
        {this.props.collection.map((option, index) => this.optionElement(option, index))}
      </div>
    )
  }

  inputRadioClassName () {
    const classNames = ["form-check-input"]

    if (this.props.wrapperOpts.errors.length > 0)
      classNames.push("is-invalid")

    return classNames.join(" ")
  }

  generatedId () {
    return Math.random()
      .toString(36)
      .substring(2, 15) + Math.random()
      .toString(36)
      .substring(2, 15)
  }

  optionElement (option, index) {
    const {collection} = digs(this.props, "collection")
    const id = this.generatedId()

    return (
      <div className="form-check" key={`option-${option[1]}`}>
        <input
          checked={"value" in this.props.inputProps ? option[1] == this.props.inputProps.value : undefined}
          className={this.inputRadioClassName()}
          data-option-value={option[1]}
          defaultChecked={"value" in this.props.inputProps ? undefined : option[1] == this.props.inputProps.defaultValue}
          id={id}
          name={this.props.inputProps.name}
          onChange={this.onChanged}
          type="radio"
          value={option[1]}
        />

        <label className="form-check-label" htmlFor={id}>
          {option[0]}
        </label>

        {index + 1 == collection.length && this.props.wrapperOpts.errors.length > 0 &&
          <InvalidFeedback errors={this.props.wrapperOpts.errors} />
        }
      </div>
    )
  }

  onChanged = (...args) => {
    const {fieldRegistration, inputProps, onChange} = this.props

    if (inputProps.name) fieldRegistration.setValue(args[0].target.value)
    if (onChange) onChange(...args)
  }

  wrapperClassName () {
    const classNames = ["component-bootstrap-radio-buttons"]

    if (this.props.wrapperClassName)
      classNames.push(this.props.wrapperClassName)

    return classNames.join(" ")
  }
}

export default inputWrapper(ApiMakerBootstrapRadioButtons, {applyValue: applyRadioValue})
