export default class MoneyFormatter {
    static fromMoney(money: any, args?: {}): MoneyFormatter;
    static format(money: any, args?: {}): any;
    static stringToFloat(moneyString: any): number;
    static amountFromMoney(money: any): number;
    static currencyFromMoney(money: any): any;
    static isMoney(value: any): boolean;
    constructor(money: any, args?: {});
    args: {};
    money: any;
    amount: number;
    currency: any;
    toString(): any;
    decimalDigits(): any;
    prefix(): string;
}
//# sourceMappingURL=money-formatter.d.ts.map