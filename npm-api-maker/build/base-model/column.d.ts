/**
 * @typedef {object} ColumnArgType
 * @property {string} type
 */
export default class ApiMakerBaseModelColumn {
    /** @param {ColumnArgType} columnData */
    constructor(columnData: ColumnArgType);
    columnData: ColumnArgType;
    /** @returns {string} */
    getType(): string;
}
export type ColumnArgType = {
    type: string;
};
//# sourceMappingURL=column.d.ts.map