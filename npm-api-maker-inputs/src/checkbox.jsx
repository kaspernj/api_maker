const AutoSubmit = require("./auto-submit.cjs")
const {dig, digs} = require("diggerize")
const {EventListener, EventUpdated} = require("@kaspernj/api-maker")
const idForComponent = require("./id-for-component.cjs")
const nameForComponent = require("./name-for-component.cjs")
const PropTypes = require("prop-types")
const React = require("react")

export default class ApiMakerInputsCheckbox extends React.PureComponent {
  static defaultProps = {
    autoRefresh: false,
    autoSubmit: false,
    defaultValue: 1,
    zeroInput: true
  }

  static propTypes = {
    attribute: PropTypes.string,
    autoRefresh: PropTypes.bool.isRequired,
    autoSubmit: PropTypes.bool.isRequired,
    defaultChecked: PropTypes.bool,
    defaultValue: PropTypes.node,
    id: PropTypes.string,
    inputRef: PropTypes.object,
    model: PropTypes.object,
    name: PropTypes.string,
    onErrors: PropTypes.func,
    onMatchValidationError: PropTypes.func,
    zeroInput: PropTypes.bool
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
      autoRefresh,
      autoSubmit,
      defaultChecked,
      defaultValue,
      id,
      inputRef,
      model,
      name,
      onChange,
      onErrors,
      zeroInput,
      ...restProps
    } = this.props
    const {form} = digs(this.state, "form")
    const inputName = this.inputName()

    return (
      <>
        {autoRefresh && model &&
          <EventUpdated model={model} onUpdated={(args) => this.onModelUpdated(args)} />
        }
        {form && onErrors && <EventListener event="validation-errors" onCalled={event => this.onValidationErrors(event)} target={form} />}
        {zeroInput && inputName &&
          <input defaultValue="0" name={inputName} type="hidden" type="hidden" />
        }
        <input
          data-auto-refresh={autoRefresh}
          data-auto-submit={autoSubmit}
          defaultChecked={this.inputDefaultChecked()}
          defaultValue={defaultValue}
          id={this.inputId()}
          name={inputName}
          onChange={(...args) => this.onChanged(...args)}
          ref={inputRef || this.inputRef}
          type="checkbox"
          {...restProps}
        />
      </>
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

  onChanged(...args) {
    const {attribute, autoSubmit, model, onChange} = this.props

    if (attribute && autoSubmit && model) new AutoSubmit({component: this}).autoSubmit()
    if (onChange) onChange(...args)
  }

  onModelUpdated(args) {
    const inputRef = this.props.inputRef || this.inputRef

    if (!inputRef.current) {
      // This can happen if the component is being unmounted
      return
    }

    const {attribute} = digs(this.props, "attribute")
    const newModel = digg(args, "model")
    const currentChecked = digg(inputRef, "current", "checked")
    const newValue = newModel.readAttribute(attribute)

    if (currentChecked != newValue) {
      inputRef.current.checked = newValue
    }
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
