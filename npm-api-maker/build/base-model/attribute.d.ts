/**
 * @typedef AttributeArgType
 * @property {string} column
 * @property {string} name
 * @property {boolean} selected_by_default
 * @property {boolean} translated
 * @property {string} type
 */
export default class ApiMakerBaseModelAttribute {
    /** @param {AttributeArgType} attributeData */
    constructor(attributeData: AttributeArgType);
    attributeData: AttributeArgType;
    /**
     * @returns {Column}
     */
    getColumn(): Column;
    column: Column;
    /** @returns {boolean} */
    isColumn(): boolean;
    /** @returns {boolean} */
    isSelectedByDefault(): boolean;
    /** @returns {boolean} */
    isTranslated(): boolean;
    /** @returns {string} */
    name(): string;
}
export type AttributeArgType = {
    column: string;
    name: string;
    selected_by_default: boolean;
    translated: boolean;
    type: string;
};
import Column from "./column.js";
//# sourceMappingURL=attribute.d.ts.map