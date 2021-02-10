const { idForComponent, nameForComponent, Select } = require("@kaspernj/api-maker-inputs")
const inflection = require("inflection")
const InvalidFeedback = require("./invalid-feedback")
const PropTypes = require("prop-types")
const React = require("react")

export default class ApiMakerBootstrapSelect extends React.Component {
  static propTypes = {
    attribute: PropTypes.string,
    className: PropTypes.string,
    description: PropTypes.node,
    id: PropTypes.string,
    hint: PropTypes.node,
    hintBottom: PropTypes.node,
    inputRef: PropTypes.object,
    label: PropTypes.node,
    labelContainerClassName: PropTypes.string,
    model: PropTypes.object,
    placeholder: PropTypes.string,
    wrapperClassName: PropTypes.string
  }

  inputRef = React.createRef()
  state = {
    errors: []
  }

  render() {
    const { errors } = this.state
    const {
      className,
      description,
      id,
      inputRef,
      hint,
      hintBottom,
      label,
      labelContainerClassName,
      name,
      placeholder,
      wrapperClassName,
      ...restProps
    } = this.props

    return (
      <div className={this.wrapperClassName()}>
        {this.label() &&
          <div className={labelContainerClassName ? labelContainerClassName : null}>
            <label className={this.labelClassName()} htmlFor={this.inputId()}>
              {this.label()}
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
        <Select
          className={this.selectClassName()}
          id={this.inputId()}
          inputRef={this.props.inputRef || this.inputRef}
          name={this.inputName()}
          onErrors={(errors) => this.onErrors(errors)}
          {...restProps}
        />
        {hintBottom &&
          <span className="form-text text-muted font-smoothing font-xs">
            {hintBottom}
          </span>
        }
        {errors.length > 0 && <InvalidFeedback errors={errors} />}
      </div>
    )
  }

  inputId() {
    return idForComponent(this)
  }

  inputName() {
    return nameForComponent(this)
  }

  label() {
    if ("label" in this.props) {
      return this.props.label
    } else if (this.props.model) {
      const attributeMethodName = inflection.camelize(this.props.attribute.replace(/_id$/, ""), true)
      return this.props.model.modelClass().humanAttributeName(attributeMethodName)
    }
  }

  labelClassName() {
    const classNames = ["form-group-label"]

    if (this.props.labelClassName)
      classNames.push(this.props.labelClassName)

    return classNames.join(" ")
  }

  onErrors(errors) {
    this.setState({errors})
  }

  selectClassName() {
    const classNames = ["form-control"]

    if (this.props.className) classNames.push(this.props.className)

    if (this.state.errors.length > 0)
      classNames.push("is-invalid")

    return classNames.join(" ")
  }

  wrapperClassName() {
    const classNames = ["form-group", "component-bootstrap-select"]

    if (this.props.wrapperClassName)
      classNames.push(this.props.wrapperClassName)

    return classNames.join(" ")
  }
}
