import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component.js"
import Checkbox from "../inputs/checkbox"
import classNames from "classnames"
import {digs} from "diggerize"
import InvalidFeedback from "./invalid-feedback"
import memo from "set-state-compare/src/memo"
import PropTypes from "prop-types"
import React from "react"
import useInput from "../use-input"

export default memo(shapeComponent(class ApiMakerBootstrapCheckbox extends ShapeComponent {
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

  setup() {
    const {inputProps, restProps: useInputRestProps, wrapperOpts} = useInput({props: this.props, wrapperOptions: {type: "checkbox"}})

    this.setInstance({inputProps, useInputRestProps, wrapperOpts})
  }

  render () {
    const {inputProps, useInputRestProps, wrapperOpts} = this.tt
    const {className, hint, id, inputRef, label, labelClassName, wrapperClassName, ...restProps} = useInputRestProps
    const {errors} = digs(wrapperOpts, "errors")

    return (
      <div className={this.wrapperClassName()}>
        <div className="form-check">
          <Checkbox
            className={classNames("form-check-input", className, {"is-invalid": errors.length > 0})}
            id={id}
            inputRef={inputRef}
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
}))
