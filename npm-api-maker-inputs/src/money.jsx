const {digg} = require("diggerize")
const idForComponent = require("./id-for-component.cjs")
const inflection = require("inflection")
const {MoneyFormatter} = require("@kaspernj/api-maker")
const PropTypes = require("prop-types")
const PropTypesExact = require("prop-types-exact")
const React = require("react")

export default class ApiMakerInputsMoney extends React.PureComponent {
  static defaultProps = {
    showCurrencyOptions: true
  }

  static propTypes = PropTypesExact({
    attribute: PropTypes.string,
    className: PropTypes.string,
    currenciesCollection: PropTypes.array.isRequired,
    currencyName: PropTypes.string,
    id: PropTypes.string,
    inputRef: PropTypes.object,
    model: PropTypes.object,
    name: PropTypes.string,
    onChange: PropTypes.func,
    placeholder: PropTypes.node,
    showCurrencyOptions: PropTypes.bool,
    small: PropTypes.bool
  })

  inputRef = React.createRef()
  state = {}

  getInputRef () {
    return this.props.inputRef || this.inputRef
  }

  render () {
    const {showCurrencyOptions} = this.props

    return (
      <div className="component-api-maker-bootstrap-money-input">
        <input defaultValue={this.inputDefaultCentsValue()} id={this.inputCentsId()} name={this.inputCentsName()} ref={this.getInputRef()} type="hidden" />

        <div className="input-group">
          <input
            className={this.props.className}
            defaultValue={this.inputDefaultValue()}
            id={this.inputId()}
            onBlur={this.setAmount}
            onChange={this.setCents}
            onKeyUp={this.setCents}
            placeholder={this.props.placeholder}
            ref="whole"
            type="text"
          />
          {showCurrencyOptions &&
            <select className="component-bootstrap-money-input" defaultValue={this.inputCurrencyValue()} id={this.inputCurrencyId()} name={this.inputCurrencyName()} onChange={this.onCurrencyChanged} ref="currency">
              <option></option>
              {this.props.currenciesCollection.map((option) => (
                <option key={`select-option-${option[1]}`} value={option[1]}>
                  {this.props.small && option[1]}
                  {!this.props.small && option[0]}
                </option>
              ))}
            </select>
          }
        </div>
      </div>
    )
  }

  checkAttributeExists () {
    if (this.props.model && !this.props.model[this.props.attribute])
      throw new Error(`No such attribute: ${digg(this.props.model.modelClassData(), "name")}#${this.props.attribute}`)
  }

  inputCurrencyId () {
    return `${this.inputId()}_currency`
  }

  inputCurrencyName () {
    if (this.props.currencyName)
      return this.props.currencyName

    return `${this.props.model.modelClassData().paramKey}[${inflection.underscore(this.props.attribute)}_currency]`
  }

  inputCurrencyValue () {
    this.checkAttributeExists()
    let value = this.props.model[this.props.attribute]()

    if (value) {
      return MoneyFormatter.currencyFromMoney(value).code
    } else {
      return "DKK"
    }
  }

  inputDefaultValue () {
    this.checkAttributeExists()
    let value = this.props.model[this.props.attribute]()

    if (value) {
      return MoneyFormatter.fromMoney({amount: value.amount, currency: this.inputCurrencyValue()}, {decimals: 2, excludeCurrency: true}).toString()
    } else {
      return ""
    }
  }

  inputDefaultCentsValue () {
    const {attribute, model} = this.props

    if (!(attribute in model)) throw new Error(`No such attribute on ${model.modelClassData().name}: ${attribute}`)

    let value = model[attribute]()

    if (this.getInputRef().current)
      return digg(this.getInputRef(), "current", "value")

    if (value)
      return MoneyFormatter.amountFromMoney(value)
  }

  inputCentsId () {
    return `${this.inputId()}_cents`
  }

  inputCentsName () {
    if (this.props.name)
      return this.props.name

    return `${this.props.model.modelClassData().paramKey}[${inflection.underscore(this.props.attribute)}_cents]`
  }

  inputId () {
    return idForComponent(this)
  }

  onCurrencyChanged = () => {
    if (this.props.onChange)
      this.props.onChange()
  }

  setAmount = () => {
    const inputElement = this.getInputRef().current

    if (!inputElement.value && inputElement.value == "") {
      this.refs.whole.value = ""
    } else {
      const cents = parseFloat(inputElement.value)
      const formatted = MoneyFormatter.fromMoney({amount: cents, currency: this.inputCurrencyValue()}, {decimals: 2, excludeCurrency: true}).toString()

      this.refs.whole.value = formatted
    }
  }

  setCents = () => {
    const inputElement = this.getInputRef().current

    let whole = MoneyFormatter.stringToFloat(this.refs.whole.value)
    let cents = parseInt(whole * 100, 10)
    let oldCents = parseInt(inputElement.value, 10)

    if (cents) {
      inputElement.value = cents
    } else {
      inputElement.value = ''
    }

    if (this.props.onChange && oldCents != cents)
      this.props.onChange()
  }
}
