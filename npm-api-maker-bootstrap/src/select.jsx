const {digs} = require("diggerize")
const {inputWrapper, Select} = require("@kaspernj/api-maker-inputs")
const InvalidFeedback = require("./invalid-feedback").default
const PropTypes = require("prop-types")
const React = require("react")

class ApiMakerBootstrapSelect extends React.PureComponent {
  static propTypes = {
    attribute: PropTypes.string,
    className: PropTypes.string,
    description: PropTypes.node,
    id: PropTypes.string,
    hint: PropTypes.node,
    hintBottom: PropTypes.node,
    inputProps: PropTypes.object.isRequired,
    label: PropTypes.node,
    labelContainerClassName: PropTypes.string,
    model: PropTypes.object,
    placeholder: PropTypes.string,
    wrapperClassName: PropTypes.string
  }

  render () {
    const {
      children,
      className,
      description,
      id,
      inputProps,
      hint,
      hintBottom,
      label,
      labelContainerClassName,
      name,
      placeholder,
      wrapperClassName,
      wrapperProps,
      ...restProps
    } = this.props
    const {ref, ...forwardedInputProps} = inputProps
    const {errors} = digs(wrapperProps, "errors")

    return (
      <div className={this.wrapperClassName()}>
        {label &&
          <div className={labelContainerClassName ? labelContainerClassName : null}>
            <label className={this.labelClassName()} htmlFor={inputProps.id}>
              {label}
            </label>
          </div>
        }
        {description &&
          <div className="mb-4">
            {description}
          </div>
        }
        {hint &&
          <span className="font-smoothing font-xs form-text text-muted">
            {hint}
          </span>
        }
        {children}
        {!children &&
          <Select
            {...forwardedInputProps}
            className={this.selectClassName()}
            {...restProps}
          />
        }
        {hintBottom &&
          <span className="form-text text-muted font-smoothing font-xs">
            {hintBottom}
          </span>
        }
        {errors.length > 0 && <InvalidFeedback errors={errors} />}
      </div>
    )
  }

  labelClassName () {
    const classNames = ["form-group-label"]

    if (this.props.labelClassName)
      classNames.push(this.props.labelClassName)

    return classNames.join(" ")
  }

  selectClassName () {
    const classNames = ["form-control"]

    if (this.props.className) classNames.push(this.props.className)
    if (this.props.wrapperProps.errors.length > 0) classNames.push("is-invalid")

    return classNames.join(" ")
  }

  wrapperClassName () {
    const classNames = ["form-group", "component-bootstrap-select"]

    if (this.props.wrapperClassName) classNames.push(this.props.wrapperClassName)

    return classNames.join(" ")
  }
}

export default inputWrapper(ApiMakerBootstrapSelect, {type: "select"})
