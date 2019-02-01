import Api from "api-maker/api"
import formatNumber from "format-number"
import PropTypes from "prop-types"
import React from "react"

const inflection = require("inflection")

export default class BootstrapMoneyInput extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}

    let formatOptions = {
      decimal: I18n.t("number.currency.format.separator"),
      integerSeparator: I18n.t("number.currency.format.delimiter")
    }
    this.formatter = formatNumber(formatOptions)
  }

  render() {
    if (!this.state.currenciesCollection)
      return ""

    return (
      <div className="input-group">
        <input defaultValue={this.inputDefaultCentsValue()} id={this.inputCentsId()} name={this.inputCentsName()} ref="input" type="hidden" />
        <input
          className={this.props.className}
          id={this.inputId()}
          onBlur={() => { this.setAmount() }}
          onChange={() => { this.setCents() }}
          onKeyUp={() => { this.setCents() }}
          placeholder={this.props.placeholder}
          ref="whole"
          type="text"
          />
        <select className="component-bootstrap-money-input" defaultValue={this.inputCurrencyValue()} id={this.inputCurrencyId()} name={this.inputCurrencyName()} onChange={() => { this.onCurrencyChanged() }} ref="currency">
          <option></option>
          {this.props.currenciesCollection.map(option => (
            <option key={`select-option-${option[1]}`} value={option[1]}>
              {this.props.small && option[1]}
              {!this.props.small && option[0]}
            </option>
          ))}
        </select>
      </div>
    )
  }

  inputCurrencyId() {
    return `${this.inputId()}_currency`
  }

  inputCurrencyName() {
    if (this.props.currencyName)
      return this.props.currencyName

    return `${this.props.model.modelClassData().paramKey}[${inflection.underscore(this.props.attribute)}_currency]`
  }

  inputCurrencyValue() {
    let value = this.props.model[this.props.attribute]()

    if (value) {
      return MoneyFormatter.currencyFromMoney(value).code
    } else {
      return "DKK"
    }
  }

  inputDefaultCentsValue() {
    let value = this.props.model[this.props.attribute]()

    if (this.refs.input)
      return this.refs.input.value

    if (value)
      return MoneyFormatter.amountFromMoney(value)
  }

  inputCentsId() {
    return `${this.inputId()}_cents`
  }

  inputCentsName() {
    if (this.props.name)
      return this.props.name

    return `${this.props.model.modelClassData().paramKey}[${inflection.underscore(this.props.attribute)}_cents]`
  }

  inputId() {
    return `${this.props.model.modelClassData().paramKey}_${inflection.underscore(this.props.attribute)}`
  }

  onCurrencyChanged() {
    if (this.props.onChange)
      this.props.onChange()
  }

  setAmount() {
    if (!this.refs.input.value && this.refs.input.value == "") {
      this.refs.whole.value = ""
    } else {
      let cents = parseFloat(this.refs.input.value)
      let formatted = MoneyFormatter.fromMoney({amount: cents, currency: this.inputCurrencyValue()}, {decimals: 2, excludeCurrency: true}).toString()

      this.refs.whole.value = formatted
    }
  }

  setCents() {
    let whole = MoneyFormatter.stringToFloat(this.refs.whole.value)
    let cents = parseInt(whole * 100)
    let oldCents = parseInt(this.refs.input.value)
    this.refs.input.value = cents

    if (this.props.onChange && oldCents != cents)
      this.props.onChange()
  }
}

BootstrapMoneyInput.propTypes = {
  currenciesCollection: PropTypes.array.isRequired
}
