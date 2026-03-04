import I18nOnSteroids from "i18n-on-steroids"
import Money from "js-money"
import formatNumber from "format-number"
import replaceall from "replaceall"

/** Money formatter and converter utilities. */
export default class MoneyFormatter {
  /**
   * @param {Money | {amount?: number | string, fractional?: number | string, currency: any}} money
   * @param {{decimals?: number | null, excludeCurrency?: boolean}} [args]
   * @returns {MoneyFormatter}
   */
  static fromMoney (money, args = {}) {
    return new MoneyFormatter(money, args)
  }

  /**
   * @param {Money | {amount?: number | string, fractional?: number | string, currency: any}} money
   * @param {{decimals?: number | null, excludeCurrency?: boolean}} [args]
   * @returns {string}
   */
  static format (money, args = {}) {
    return MoneyFormatter.fromMoney(money, args).toString()
  }

  /**
   * @param {string} moneyString
   * @returns {number}
   */
  static stringToFloat (moneyString) {
    let unformatted = replaceall(I18nOnSteroids.getCurrent().t("number.currency.format.delimiter"), "", moneyString)

    unformatted = replaceall(I18nOnSteroids.getCurrent().t("number.currency.format.separator"), ".", unformatted)
    const float = parseFloat(unformatted)

    return float
  }

  /**
   * @param {Money | {amount?: number | string, fractional?: number | string, currency: any}} money
   * @returns {number}
   */
  static amountFromMoney (money) {
    if ("amount" in money) {
      return parseFloat(money.amount)
    } else if ("fractional" in money) {
      return parseFloat(money.fractional)
    }

    throw new Error(`Couldn't figure out amount from: ${JSON.stringify(money, null, 2)}`)
  }

  /**
   * @param {Money | {currency: any}} money
   * @returns {any}
   */
  static currencyFromMoney (money) {
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

  /**
   * @param {any} value
   * @returns {boolean}
   */
  static isMoney(value) {
    if (value instanceof Money) return true

    if (typeof value == "object" && value && Object.keys(value).length == 2 && "amount" in value && "currency" in value)
      return true

    return false
  }

  /**
   * @param {Money | {amount?: number | string, fractional?: number | string, currency: any}} money
   * @param {{decimals?: number | null, excludeCurrency?: boolean}} [args]
   */
  constructor (money, args = {}) {
    this.args = args
    this.money = money
    this.amount = MoneyFormatter.amountFromMoney(money)
    this.currency = MoneyFormatter.currencyFromMoney(money)
  }

  /** @returns {string} */
  toString () {
    const amount = (this.amount / 100).toFixed(this.decimalDigits())
    const formatOptions = {
      prefix: this.prefix(),
      decimal: I18nOnSteroids.getCurrent().t("number.currency.format.separator"),
      integerSeparator: I18nOnSteroids.getCurrent().t("number.currency.format.delimiter")
    }

    // @ts-expect-error
    return formatNumber(formatOptions)(amount)
  }

  /** @returns {number} */
  decimalDigits () {
    if (this.args.decimals !== null) {
      return this.args.decimals
    }

    return this.currency.decimal_digits
  }

  /** @returns {string} */
  prefix () {
    if (this.args.excludeCurrency) {
      return ""
    }

    return `${this.currency.code} `
  }
}
