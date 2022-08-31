import {Checkbox} from "../inputs/checkbox"
import classNames from "classnames"
import {digs} from "diggerize"
import inputWrapper from "../inputs/input-wrapper"
import InvalidFeedback from "./invalid-feedback"
import PropTypes from "prop-types"
import React from "react"

class ApiMakerBootstrapCheckbox extends React.PureComponent {
  static defaultProps = {
    defaultValue: 1,
    zeroInput: true
  }

  static propTypes = {
    attribute: PropTypes.string,
    className: PropTypes.string,
    defaultChecked: PropTypes.bool,
    defaultValue: PropTypes.node,
    hint: PropTypes.node,
    id: PropTypes.string,
    label: PropTypes.node,
    labelClassName: PropTypes.string,
    model: PropTypes.object,
    name: PropTypes.string,
    onChange: PropTypes.func,
    wrapperClassName: PropTypes.string,
    zeroInput: PropTypes.bool
  }

  render () {
    const {className, hint, id, inputProps, inputRef, label, labelClassName, wrapperClassName, wrapperOpts, ...restProps} = this.props
    const {errors} = digs(wrapperOpts, "errors")

    return (
      <div className={this.wrapperClassName()}>
        <div className="form-check">
          <Checkbox
            className={classNames("form-check-input", className, {"is-invalid": errors.length > 0})}
            inputProps={inputProps}
            wrapperOpts={wrapperOpts}
            {...restProps}
          />
          {wrapperOpts.label &&
            <label className={this.labelClassName()} htmlFor={inputProps.id}>
              {wrapperOpts.label}
            </label>
          }
          {hint &&
            <p className="text-muted">
              {hint}
            </p>
          }
          {errors.length > 0 && <InvalidFeedback errors={errors} />}
        </div>
      </div>
    )
  }

  labelClassName () {
    const classNames = ["form-check-label"]

    if (this.props.labelClassName)
      classNames.push(this.props.labelClassName)

    return classNames.join(" ")
  }

  wrapperClassName () {
    const classNames = ["component-bootstrap-checkbox", "form-group"]

    if (this.props.wrapperClassName)
      classNames.push(this.props.wrapperClassName)

    return classNames.join(" ")
  }
}

export default inputWrapper(ApiMakerBootstrapCheckbox, {type: "checkbox"})
