const {Checkbox, idForComponent, nameForComponent} = require("@kaspernj/api-maker-inputs")
const classNames = require("classnames")
const InvalidFeedback = require("./invalid-feedback").default
const PropTypes = require("prop-types")
const React = require("react")

export default class ApiMakerBootstrapCheckbox extends React.PureComponent {
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

  state = {
    errors: []
  }

  render() {
    const { className, hint, id, label, labelClassName, onMatchValidationError, wrapperClassName, ...restProps } = this.props
    const { errors } = this.state

    return (
      <div className={this.wrapperClassName()}>
        <div className="form-check">
          <Checkbox
            defaultChecked={this.inputDefaultChecked()}
            className={classNames("form-check-input", className, {"is-invalid": errors.length > 0})}
            id={this.inputId()}
            name={this.inputName()}
            onErrors={(errors) => this.onErrors(errors)}
            {...restProps}
          />

          {this.label() &&
            <label className={this.labelClassName()} htmlFor={this.inputId()}>
              {this.label()}
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

  label() {
    const { attribute, label, model } = this.props

    if ("label" in this.props) {
      return label
    } else if (attribute && model) {
      return model.modelClass().humanAttributeName(attribute)
    }
  }

  labelClassName() {
    const classNames = ["form-check-label"]

    if (this.props.labelClassName)
      classNames.push(this.props.labelClassName)

    return classNames.join(" ")
  }

  wrapperClassName() {
    const classNames = ["component-bootstrap-checkbox", "form-group"]

    if (this.props.wrapperClassName)
      classNames.push(this.props.wrapperClassName)

    return classNames.join(" ")
  }

  onErrors(errors) {
    this.setState({errors})
  }
}
