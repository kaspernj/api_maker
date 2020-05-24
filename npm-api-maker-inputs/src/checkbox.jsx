import classNames from "classnames"
import idForComponent from "./id-for-component"
import nameForComponent from "./name-for-component"
import PropTypes from "prop-types"
import React from "react"

export default class ApiMakerCheckbox extends React.Component {
  static defaultProps = {
    defaultValue: 1,
    zeroInput: true
  }

  static propTypes = {
    attribute: PropTypes.string,
    className: PropTypes.string,
    defaultChecked: PropTypes.bool,
    defaultValue: PropTypes.node,
    id: PropTypes.string,
    model: PropTypes.object,
    name: PropTypes.string,
    zeroInput: PropTypes.bool
  }

  constructor(props) {
    super(props)
    this.state = {
      validationErrors: []
    }
  }

  render() {
    const { attribute, className, defaultChecked, defaultValue, id, model, name, zeroInput, ...restProps } = this.props

    return (
      <>
        {zeroInput &&
          <input defaultValue="0" name={this.inputName()} type="hidden" type="hidden" />
        }
        <input
          defaultChecked={this.inputDefaultChecked()}
          className={classNames("form-check-input", className)}
          defaultValue={defaultValue}
          id={this.inputId()}
          name={this.inputName()}
          ref="input"
          type="checkbox"
          {...restProps}
          />
      </>
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
}
