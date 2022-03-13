const {dig} = require("diggerize")
const {EventListener} = require("@kaspernj/api-maker")
const idForComponent = require("./id-for-component.cjs")
const inputWrapper = require("./input-wrapper").default
const nameForComponent = require("./name-for-component.cjs")
const PropTypes = require("prop-types")
const React = require("react")

class ApiMakerBootstrapSelect extends React.PureComponent {
  static propTypes = {
    attribute: PropTypes.string,
    children: PropTypes.node,
    defaultValue: PropTypes.oneOfType([PropTypes.array, PropTypes.number, PropTypes.string]),
    id: PropTypes.string,
    includeBlank: PropTypes.bool,
    inputProps: PropTypes.object.isRequired,
    inputRef: PropTypes.object,
    model: PropTypes.object,
    name: PropTypes.string,
    options: PropTypes.array,
    wrapperOpts: PropTypes.object.isRequired
  }

  inputRef = React.createRef()
  state = {
    form: undefined
  }

  componentDidMount () {
    if (this.props.onErrors) {
      this.setForm()
    }
  }

  componentDidUpdate () {
    if (this.props.onErrors) {
      this.setForm()
    }
  }

  setForm () {
    const form = dig(this.props.inputRef || this.inputRef, "current", "form")

    if (form != this.state.form) {
      this.setState({form})
    }
  }

  render () {
    const {
      attribute,
      children,
      defaultValue,
      id,
      includeBlank,
      inputProps,
      inputRef,
      model,
      name,
      options,
      wrapperOpts,
      ...restProps
    } = this.props

    return (
      <select {...inputProps} {...restProps}>
        {this.includeBlank() &&
          <option />
        }
        {options && options.map((option) =>
          <option key={this.optionKey(option)} value={this.optionValue(option)}>
            {this.optionLabel(option)}
          </option>
        )}
        {children}
      </select>
    )
  }

  optionKey (option) {
    if (Array.isArray(option)) {
      return `select-option-${option[1]}`
    } else {
      return `select-option-${option}`
    }
  }

  optionLabel (option) {
    if (Array.isArray(option)) {
      return option[0]
    } else {
      return option
    }
  }

  optionValue (option) {
    if (Array.isArray(option)) {
      return option[1]
    } else {
      return option
    }
  }

  includeBlank () {
    if (this.props.includeBlank && !this.props.multiple) {
      return true
    } else {
      return false
    }
  }
}

export default inputWrapper(ApiMakerBootstrapSelect)
