const {dig} = require("@kaspernj/object-digger")
const {EventListener} = require("@kaspernj/api-maker")
const idForComponent = require("./id-for-component.cjs")
const nameForComponent = require("./name-for-component.cjs")
const PropTypes = require("prop-types")
const React = require("react")

export default class ApiMakerBootstrapSelect extends React.PureComponent {
  static propTypes = {
    attribute: PropTypes.string,
    children: PropTypes.node,
    defaultValue: PropTypes.oneOfType([PropTypes.array, PropTypes.number, PropTypes.string]),
    id: PropTypes.string,
    includeBlank: PropTypes.bool,
    inputRef: PropTypes.object,
    model: PropTypes.object,
    name: PropTypes.string,
    onErrors: PropTypes.func,
    onMatchValidationError: PropTypes.func,
    options: PropTypes.array
  }

  inputRef = React.createRef()
  state = {
    form: undefined
  }

  componentDidMount() {
    if (this.props.onErrors) {
      this.setForm()
    }
  }

  componentDidUpdate() {
    if (this.props.onErrors) {
      this.setForm()
    }
  }

  setForm() {
    const form = dig(this.props.inputRef || this.inputRef, "current", "form")

    if (form != this.state.form) {
      this.setState({form})
    }
  }

  render() {
    const {
      attribute,
      children,
      defaultValue,
      id,
      includeBlank,
      inputRef,
      model,
      name,
      onErrors,
      onMatchValidationError,
      options,
      ...restProps
    } = this.props
    const {form} = this.state

    return (
      <>
        {form && onErrors && <EventListener event="validation-errors" onCalled={event => this.onValidationErrors(event)} target={form} />}
        <select
          defaultValue={this.inputDefaultValue()}
          id={idForComponent(this)}
          name={this.inputName()}
          ref={this.props.inputRef || this.inputRef}
          {...restProps}
        >
          {this.includeBlank() &&
            <option />
          }
          {options && options.map(option =>
            <option key={`select-option-${option[1]}`} value={option[1]}>
              {option[0]}
            </option>
          )}
          {children}
        </select>
      </>
    )
  }

  includeBlank() {
    if (this.props.includeBlank && !this.props.multiple) {
      return true
    } else {
      return false
    }
  }

  inputDefaultValue() {
    if ("defaultValue" in this.props) {
      return this.props.defaultValue
    } else if (this.props.attribute && this.props.model) {
      if (!this.props.model[this.props.attribute])
        throw new Error(`No attribute by that name: ${this.props.attribute}`)

      return this.props.model[this.props.attribute]()
    }
  }

  inputName() {
    return nameForComponent(this)
  }

  onValidationErrors(event) {
    const {onErrors} = this.props

    if (!onErrors) {
      return
    }

    const errors = event.detail.getValidationErrorsForInput({
      attribute: this.props.attribute,
      inputName: this.inputName(),
      onMatchValidationError: this.props.onMatchValidationError
    })

    onErrors(errors)
  }
}
