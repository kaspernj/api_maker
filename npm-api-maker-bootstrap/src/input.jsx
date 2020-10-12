import {Input, idForComponent, Money, nameForComponent} from "@kaspernj/api-maker-inputs"
import InvalidFeedback from "./invalid-feedback"
import PropTypes from "prop-types"
import React from "react"

export default class ApiMakerBootstrapInput extends React.Component {
  static propTypes = {
    append: PropTypes.node,
    attribute: PropTypes.string,
    className: PropTypes.string,
    currenciesCollection: PropTypes.array,
    currencyName: PropTypes.string,
    hint: PropTypes.node,
    hintBottom: PropTypes.node,
    id: PropTypes.string,
    label: PropTypes.node,
    labelClassName: PropTypes.string,
    model: PropTypes.object,
    name: PropTypes.string,
    placeholder: PropTypes.node,
    prepend: PropTypes.node,
    small: PropTypes.bool,
    type: PropTypes.string,
    wrapperClassName: PropTypes.string
  }

  constructor(props) {
    super(props)
    this.state = {
      errors: []
    }
  }

  render() {
    const {errors} = this.state
    const {
      append,
      attribute,
      className,
      currenciesCollection,
      currencyName,
      hint,
      hintBottom,
      id,
      label,
      labelClassName,
      model,
      name,
      prepend,
      wrapperClassName,
      ...restProps
    } = this.props

    return (
      <div className={this.wrapperClassName()} ref="wrapper">
        {this.label() &&
          <label className={this.labelClassName()} htmlFor={this.inputId()}>
            {this.label()}
          </label>
        }
        {hint &&
          <span className="form-text text-muted font-smoothing font-xs">
            {hint}
          </span>
        }
        {this.inputType() == "money" &&
          <Money
            attribute={attribute}
            currenciesCollection={currenciesCollection}
            currencyName={currencyName}
            model={model}
            name={name}
            className={this.inputClassName()}
            onChange={this.props.onChange}
            placeholder={this.props.placeholder}
            small={this.props.small}
            ref="money"
          />
        }
        {this.inputType() != "money" &&
          <div className="input-group">
            {prepend &&
              <div className="input-group-prepend">
                <span className="input-group-text">
                  {prepend}
                </span>
              </div>
            }
            <Input
              attribute={attribute}
              className={this.inputClassName()}
              id={this.inputId()}
              model={model}
              name={this.inputName()}
              onErrors={(errors) => this.onErrors(errors)}
              ref="input"
              type={this.inputType()}
              {...restProps}
            />
            {append &&
              <div className="input-group-append">
                <span className="input-group-text">
                  {append}
                </span>
              </div>
            }
            {errors.length > 0 && <InvalidFeedback errors={errors} />}
          </div>
        }
        {hintBottom &&
          <span className="form-text text-muted font-smoothing font-xs">
            {hintBottom}
          </span>
        }
      </div>
    )
  }

  inputClassName() {
    const classNames = ["form-control"]

    if (this.props.className)
      classNames.push(this.props.className)

    if (this.state.errors.length > 0)
      classNames.push("is-invalid")

    return classNames.join(" ")
  }

  inputId() {
    return idForComponent(this)
  }

  inputName() {
    return nameForComponent(this)
  }

  inputType() {
    if (this.props.type) {
      return this.props.type
    } else {
      return "text"
    }
  }

  label() {
    if ("label" in this.props) {
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

  onErrors(errors) {
    this.setState({errors})
  }

  wrapperClassName() {
    const classNames = ["form-group", "component-bootstrap-string-input"]

    if (this.props.wrapperClassName)
      classNames.push(this.props.wrapperClassName)

    return classNames.join(" ")
  }
}
