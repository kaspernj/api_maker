import {digs} from "diggerize"
import inputWrapper from "../inputs/input-wrapper.js"
import {Input} from "../inputs/input.js"
import InvalidFeedback from "./invalid-feedback.js"
import memo from "set-state-compare/build/memo.js"
import Money from "../inputs/money.js"
import PropTypes from "prop-types"
import React from "react"
import {shapeComponent, ShapeComponent} from "set-state-compare/build/shape-component.js"

const ApiMakerBootstrapInput = memo(shapeComponent(class ApiMakerBootstrapInput extends ShapeComponent {
  static propTypes = {
    append: PropTypes.any,
    appendText: PropTypes.any,
    attribute: PropTypes.string,
    className: PropTypes.string,
    currenciesCollection: PropTypes.array,
    currencyName: PropTypes.string,
    hint: PropTypes.any,
    hintBottom: PropTypes.any,
    id: PropTypes.string,
    label: PropTypes.any,
    labelClassName: PropTypes.string,
    model: PropTypes.object,
    name: PropTypes.string,
    placeholder: PropTypes.any,
    prepend: PropTypes.any,
    prependText: PropTypes.any,
    small: PropTypes.bool,
    type: PropTypes.string,
    wrapperClassName: PropTypes.string
  }

  render () {
    const {
      append,
      appendText,
      attribute,
      className,
      currenciesCollection,
      currencyName,
      hint,
      hintBottom,
      id,
      inputClassName,
      inputProps,
      inputRef,
      label,
      labelClassName,
      model,
      name,
      prepend,
      prependText,
      type,
      wrapperClassName,
      wrapperOpts,
      ...restProps
    } = this.props
    const {ref, ...forwardedInputProps} = inputProps
    const {errors} = digs(wrapperOpts, "errors")

    return (
      <div className={this.wrapperClassName()} ref={this.props.wrapperRef}>
        {wrapperOpts.label &&
          <label className={this.labelClassName()} htmlFor={inputProps.id}>
            {wrapperOpts.label}
          </label>
        }
        {hint &&
          <span className="form-text text-muted font-smoothing font-xs">
            {hint}
          </span>
        }
        {type == "money" &&
          <Money
            name={inputProps.name}
            className={this.inputClassName()}
            ref={this.props.moneyRef}
            {...this.moneyProps()}
          />
        }
        {type != "money" &&
          <div className="input-group">
            {(prepend || prependText) &&
              <div className="input-group-prepend">
                {prependText &&
                  <span className="input-group-text">
                    {prependText}
                  </span>
                }
                {prepend}
              </div>
            }
            <Input
              attribute={attribute}
              className={this.inputClassName()}
              inputProps={inputProps}
              model={model}
              wrapperOpts={wrapperOpts}
              {...forwardedInputProps}
              {...restProps}
            />
            {(append || appendText) &&
              <div className="input-group-append">
                {appendText &&
                  <span className="input-group-text">
                    {appendText}
                  </span>
                }
                {append}
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

  inputClassName () {
    const classNames = ["form-control"]

    if (this.props.className)
      classNames.push(this.props.className)

    if (this.props.wrapperOpts.errors.length > 0)
      classNames.push("is-invalid")

    return classNames.join(" ")
  }

  labelClassName () {
    const classNames = []

    if (this.props.labelClassName)
      classNames.push(this.props.labelClassName)

    return classNames.join(" ")
  }

  moneyProps() {
    const moneyProps = {}
    const forwardedProps = ["attribute", "currenciesCollection", "currencyName", "model", "onChange", "placeholder", "small"]

    for (const forwardedProp of forwardedProps) {
      if (forwardedProp in this.props) moneyProps[forwardedProp] = this.props[forwardedProp]
    }

    const forwardedInputProps = ["defaultValue"]

    for (const forwardedInputProp of forwardedInputProps) {
      if (forwardedInputProp in this.props.inputProps) moneyProps[forwardedInputProp] = this.props.inputProps[forwardedInputProp]
    }

    return moneyProps
  }

  wrapperClassName () {
    const classNames = ["form-group", "component-bootstrap-string-input"]

    if (this.props.wrapperClassName)
      classNames.push(this.props.wrapperClassName)

    return classNames.join(" ")
  }
}))

export default inputWrapper(ApiMakerBootstrapInput)
