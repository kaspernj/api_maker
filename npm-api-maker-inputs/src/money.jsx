import formatNumber from "format-number"
import idForComponent from "./id-for-component"
import { MoneyFormatter } from "@kaspernj/api-maker"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React from "react"

const inflection = require("inflection")

export default class ApiMakerInputsMoney extends React.Component {
  static propTypes = PropTypesExact({
    attribute: PropTypes.string,
    className: PropTypes.string,
    currenciesCollection: PropTypes.array.isRequired,
    currencyName: PropTypes.string,
    id: PropTypes.string,
    model: PropTypes.object,
    name: PropTypes.string,
    onChange: PropTypes.func,
    placeholder: PropTypes.node,
    small: PropTypes.bool
  })

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
    return (
      <div className="component-api-maker-bootstrap-money-input">
        <input defaultValue={this.inputDefaultCentsValue()} id={this.inputCentsId()} name={this.inputCentsName()} ref="input" type="hidden" />

        <div className="input-group">
          <input
            className={this.props.className}
            defaultValue={this.inputDefaultValue()}
            id={this.inputId()}
            onBlur={() => this.setAmount()}
            onChange={() => this.setCents()}
            onKeyUp={() => this.setCents()}
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
      </div>
    )
  }

  checkAttributeExists() {
    if (this.props.model && !this.props.model[this.props.attribute])
      throw new Error(`No such attribute: ${this.props.model.modelClassData().name}#${this.props.attribute}`)
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
    this.checkAttributeExists()
    let value = this.props.model[this.props.attribute]()

    if (value) {
      return MoneyFormatter.currencyFromMoney(value).code
    } else {
      return "DKK"
    }
  }

  inputDefaultValue() {
    this.checkAttributeExists()
    let value = this.props.model[this.props.attribute]()

    if (value) {
      return MoneyFormatter.fromMoney({amount: value.amount, currency: this.inputCurrencyValue()}, {decimals: 2, excludeCurrency: true}).toString()
    } else {
      return ""
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
    return idForComponent(this)
  }

  onCurrencyChanged() {
    if (this.props.onChange)
      this.props.onChange()
  }

  setAmount() {
    if (!this.refs.input.value && this.refs.input.value == "") {
      this.refs.whole.value = ""
    } else {
      const cents = parseFloat(this.refs.input.value)
      const formatted = MoneyFormatter.fromMoney({amount: cents, currency: this.inputCurrencyValue()}, {decimals: 2, excludeCurrency: true}).toString()

      this.refs.whole.value = formatted
    }
  }

  setCents() {
    let whole = MoneyFormatter.stringToFloat(this.refs.whole.value)
    let cents = parseInt(whole * 100, 10)
    let oldCents = parseInt(this.refs.input.value, 10)

    if (cents) {
      this.refs.input.value = cents
    } else{
      this.refs.input.value = ''
    }

    if (this.props.onChange && oldCents != cents)
      this.props.onChange()
  }
}
