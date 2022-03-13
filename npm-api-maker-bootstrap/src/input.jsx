const {Input, inputWrapper, Money} = require("@kaspernj/api-maker-inputs")
const InvalidFeedback = require("./invalid-feedback").default
const PropTypes = require("prop-types")
const React = require("react")

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
      errors,
      hint,
      hintBottom,
      id,
      inputClassName,
      inputProps,
      label,
      labelClassName,
      model,
      name,
      prepend,
      prependText,
      type,
      wrapperClassName,
      ...restProps
    } = this.props

    return (
      <div className={this.wrapperClassName()} ref="wrapper">
        {label &&
          <label className={this.labelClassName()} htmlFor={id}>
            {label}
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
              model={model}
              {...inputProps}
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

    if (this.props.errors.length > 0)
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

const wrappedInput = inputWrapper(ApiMakerBootstrapInput)

export default wrappedInput
