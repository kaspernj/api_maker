import Money from "js-money"
import formatNumber from "format-number"
import replaceall from "replaceall"

export default class MoneyFormatter {
  static fromMoney(money, args = {}) {
    return new MoneyFormatter(money, args)
  }

  static format(money, args = {}) {
    return MoneyFormatter.fromMoney(money, args).toString()
  }

  static stringToFloat(moneyString) {
    let unformatted = replaceall(I18n.t("number.currency.format.delimiter"), "", moneyString)

    unformatted = replaceall(I18n.t("number.currency.format.separator"), ".", unformatted)
    const float = parseFloat(unformatted)

    return float
  }

  static amountFromMoney(money) {
    if (money.hasOwnProperty("amount")) {
      return parseFloat(money.amount)
    } else if (money.hasOwnProperty("fractional")) {
      return parseFloat(money.fractional)
    }

    throw new Error(`Couldn't figure out amount from: ${JSON.stringify(money, null, 2)}`)
  }

  static currencyFromMoney(money) {
    let currencyString

    if (typeof money.currency == "string") {
      currencyString = money.currency
    } else if (typeof money.currency.id == "string") {
      currencyString = money.currency.id
    } else if (typeof money.currency.iso_code == "string") {
      currencyString = money.currency.iso_code
    } else if (typeof money.currency.code == "string") {
      currencyString = money.currency.code
    } else {
      throw new Error(`Couldn't figure out currency from: ${JSON.stringify(money, null, 2)}`)
    }

    const moneyCurrency = Money[currencyString.toUpperCase()]

    if (!moneyCurrency) {
      throw new Error(`Could not find currency ${JSON.stringify(money, null, 2)}`)
    }

    return moneyCurrency
  }

  constructor(money, args = {}) {
    this.args = args
    this.money = money
    this.amount = MoneyFormatter.amountFromMoney(money)
    this.currency = MoneyFormatter.currencyFromMoney(money)
  }

  toString() {
    const amount = (this.amount / 100).toFixed(this.decimalDigits())
    const formatOptions = {
      prefix: this.prefix(),
      decimal: I18n.t("number.currency.format.separator"),
      integerSeparator: I18n.t("number.currency.format.delimiter")
    }

    return formatNumber(formatOptions)(amount)
  }

  decimalDigits() {
    if (this.args.decimals !== null) {
      return this.args.decimals
    }

    return this.currency.decimal_digits
  }

  prefix() {
    if (this.args.excludeCurrency) {
      return ""
    }

    return `${this.currency.code} `
  }
}
