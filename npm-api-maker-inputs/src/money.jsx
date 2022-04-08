const classNames = require("classnames")
const Config = require("@kaspernj/api-maker/src/config").default
const {digg} = require("diggerize")
const idForComponent = require("./id-for-component.cjs")
const inflection = require("inflection")
const MoneyFormatter = require("@kaspernj/api-maker/src/money-formatter")
const PropTypes = require("prop-types")
const React = require("react")

export default class ApiMakerInputsMoney extends React.PureComponent {
  static defaultProps = {
    showCurrencyOptions: true
  }

  static propTypes = {
    attribute: PropTypes.string,
    className: PropTypes.string,
    currenciesCollection: PropTypes.array,
    currencyName: PropTypes.string,
    id: PropTypes.string,
    inputRef: PropTypes.object,
    model: PropTypes.object,
    name: PropTypes.string,
    onChange: PropTypes.func,
    placeholder: PropTypes.node,
    showCurrencyOptions: PropTypes.bool,
    small: PropTypes.bool
  }

  inputRef = React.createRef()

  getInputRef () {
    return this.props.inputRef || this.inputRef
  }

  render () {
    const {attribute, className, model, showCurrencyOptions} = this.props
    let {currenciesCollection} = this.props

    if (!currenciesCollection) currenciesCollection = Config.getCurrenciesCollection()

    return (
      <div className="api-maker-inputs-money" data-attribute={attribute} data-model-id={model?.id()}>
        <input defaultValue={this.inputDefaultCentsValue()} id={this.inputCentsId()} name={this.inputCentsName()} ref={this.getInputRef()} type="hidden" />
        <input
          className={classNames("money-cents", className)}
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
          <select
            className="money-currency"
            defaultValue={this.inputCurrencyValue()}
            id={this.inputCurrencyId()}
            name={this.inputCurrencyName()}
            onChange={this.onCurrencyChanged}
            ref="currency"
          >
            <option></option>
            {currenciesCollection.map((option) => (
              <option key={`select-option-${option[1]}`} value={option[1]}>
                {this.props.small && option[1]}
                {!this.props.small && option[0]}
              </option>
            ))}
          </select>
        }
      </div>
    )
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
    const {defaultValue} = this.props

    if (defaultValue) {
      return MoneyFormatter.currencyFromMoney(defaultValue).code
    } else {
      return "DKK"
    }
  }

  inputDefaultValue () {
    const {defaultValue} = this.props

    if (defaultValue) {
      return MoneyFormatter.fromMoney({amount: defaultValue.amount, currency: this.inputCurrencyValue()}, {decimals: 2, excludeCurrency: true}).toString()
    } else {
      return ""
    }
  }

  inputDefaultCentsValue () {
    const {defaultValue} = this.props

    if (this.getInputRef().current) {
      return digg(this.getInputRef(), "current", "value")
    } else if (defaultValue) {
      return MoneyFormatter.amountFromMoney(defaultValue)
    }
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
