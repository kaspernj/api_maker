const {digs} = require("diggerize")
const inputWrapper = require("@kaspernj/api-maker-inputs/src/input-wrapper")
const {Select} = require("@kaspernj/api-maker-inputs/src/select")
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
    wrapperClassName: PropTypes.string,
    wrapperOpts: PropTypes.object.isRequired
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
      wrapperClassName,
      wrapperOpts,
      ...restProps
    } = this.props
    const {ref, ...forwardedInputProps} = inputProps
    const {errors} = digs(wrapperOpts, "errors")

    return (
      <div className={this.wrapperClassName()}>
        {wrapperOpts.label &&
          <div className={labelContainerClassName ? labelContainerClassName : null}>
            <label className={this.labelClassName()} htmlFor={inputProps.id}>
              {wrapperOpts.label}
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
            inputProps={inputProps}
            inputRef={ref}
            wrapperOpts={wrapperOpts}
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
    if (this.props.wrapperOpts.errors.length > 0) classNames.push("is-invalid")

    return classNames.join(" ")
  }

  wrapperClassName () {
    const classNames = ["form-group", "component-bootstrap-select"]

    if (this.props.wrapperClassName) classNames.push(this.props.wrapperClassName)

    return classNames.join(" ")
  }
}

export default inputWrapper(ApiMakerBootstrapSelect, {type: "select"})
