/* eslint-disable sort-imports */
import * as inflection from "inflection"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import {digg} from "diggerize"
import Config from "../config.js"
import MoneyFormatter from "../money-formatter.js"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React, {useRef} from "react"
import classNames from "classnames" // eslint-disable-line import/no-unresolved
import idForComponent from "./id-for-component.js"
import memo from "set-state-compare/build/memo.js"

export default memo(shapeComponent(class ApiMakerInputsMoney extends ShapeComponent {
  static defaultProps = {
    disabled: false,
    showCurrencyOptions: true
  }

  static propTypes = PropTypesExact({ // eslint-disable-line new-cap
    attribute: PropTypes.string,
    centsInputName: PropTypes.string,
    className: PropTypes.string,
    currenciesCollection: PropTypes.array,
    currencyName: PropTypes.string,
    currencyRef: PropTypes.object,
    defaultValue: PropTypes.object,
    disabled: PropTypes.bool.isRequired,
    id: PropTypes.string,
    inputRef: PropTypes.object,
    label: PropTypes.any,
    model: PropTypes.object,
    name: PropTypes.string,
    onChange: PropTypes.func,
    placeholder: PropTypes.any,
    showCurrencyOptions: PropTypes.bool,
    small: PropTypes.bool,
    type: PropTypes.string,
    wholeRef: PropTypes.object
  })

  setup() {
    this.inputRef = useRef()
    this.currencyRefBackup = useRef()
    this.currencyRef = this.props.currencyRef || this.currencyRefBackup
    this.wholeRefBackup = useRef()
    this.wholeRef = this.props.wholeRef || this.wholeRefBackup
  }

  getInputRef = () => this.props.inputRef || this.inputRef

  render () {
    const {attribute, className, disabled, model, showCurrencyOptions} = this.props
    let {currenciesCollection} = this.props

    if (!currenciesCollection) currenciesCollection = Config.getCurrenciesCollection()

    return (
      <div className="api-maker-inputs-money" data-attribute={attribute} data-model-id={model?.id()}>
        <input defaultValue={this.inputDefaultCentsValue()} id={this.inputCentsId()} name={this.inputCentsName()} ref={this.getInputRef()} type="hidden" />
        <input
          className={classNames("money-cents", className)}
          defaultValue={this.inputDefaultValue()}
          disabled={disabled}
          id={this.inputId()}
          onBlur={this.tt.setAmount}
          onChange={this.tt.setCents}
          onKeyUp={this.tt.setCents}
          placeholder={this.props.placeholder}
          ref={this.tt.wholeRef}
          type="text"
        />
        {showCurrencyOptions &&
          <select
            className="money-currency"
            defaultValue={this.inputCurrencyValue()}
            disabled={disabled}
            id={this.inputCurrencyId()}
            name={this.inputCurrencyName()}
            onChange={this.tt.onCurrencyChanged}
            ref={this.tt.currencyRef}
          >
            <option />
            {currenciesCollection.map((option) => ( // eslint-disable-line no-extra-parens
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

  inputCurrencyId = () => `${this.inputId()}_currency`

  inputCurrencyName () {
    if ("currencyName" in this.props) return this.props.currencyName

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

  inputCentsId = () => `${this.inputId()}_cents`

  inputCentsName () {
    if ("name" in this.props) return this.props.name

    return `${this.props.model.modelClassData().paramKey}[${inflection.underscore(this.props.attribute)}_cents]`
  }

  inputId = () => idForComponent(this)

  onCurrencyChanged = () => {
    if (this.props.onChange) this.props.onChange()
  }

  setAmount = () => {
    const inputElement = this.getInputRef().current

    if (!inputElement) return

    if (!inputElement.value && inputElement.value == "") {
      this.wholeRef.current.value = ""
    } else {
      const cents = parseFloat(inputElement.value)
      const formatted = MoneyFormatter.fromMoney({amount: cents, currency: this.inputCurrencyValue()}, {decimals: 2, excludeCurrency: true}).toString()

      this.wholeRef.current.value = formatted
    }
  }

  setCents = () => {
    const inputElement = this.getInputRef().current

    if (!inputElement) return

    let whole = MoneyFormatter.stringToFloat(this.wholeRef.current.value)
    let cents = parseInt(whole * 100, 10)
    let oldCents = parseInt(inputElement.value, 10)

    if (typeof cents == "number") {
      inputElement.value = cents
    } else {
      inputElement.value = ""
    }

    if (this.props.onChange && oldCents != cents) this.props.onChange()
  }
}))
