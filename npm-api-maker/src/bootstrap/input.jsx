import {digs} from "diggerize"
import inputWrapper from "../inputs/input-wrapper"
import {Input} from "../inputs/input"
import InvalidFeedback from "./invalid-feedback"
import Money from "../inputs/money"
import PropTypes from "prop-types"
import React from "react"

class ApiMakerBootstrapInput extends React.PureComponent {
  static propTypes = {
    append: PropTypes.node,
    appendText: PropTypes.node,
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
    prependText: PropTypes.node,
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
      <div className={this.wrapperClassName()} ref="wrapper">
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
            attribute={attribute}
            currenciesCollection={currenciesCollection}
            currencyName={currencyName}
            model={model}
            name={inputProps.name}
            className={this.inputClassName()}
            onChange={this.props.onChange}
            placeholder={this.props.placeholder}
            small={this.props.small}
            ref="money"
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

  wrapperClassName () {
    const classNames = ["form-group", "component-bootstrap-string-input"]

    if (this.props.wrapperClassName)
      classNames.push(this.props.wrapperClassName)

    return classNames.join(" ")
  }
}

export default inputWrapper(ApiMakerBootstrapInput)