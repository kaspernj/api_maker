export default class ApiMakerBaseModelReflection {
    /**
     * @param {object} reflectionData
     * @param {string} reflectionData.foreignKey
     * @param {string} reflectionData.marco
     * @param {string} reflectionData.resource_name
     * @param {string} reflectionData.name
     * @param {string} reflectionData.through
     */
    constructor(reflectionData: {
        foreignKey: string;
        marco: string;
        resource_name: string;
        name: string;
        through: string;
    });
    reflectionData: {
        foreignKey: string;
        marco: string;
        resource_name: string;
        name: string;
        through: string;
    };
    /** @returns {string} */
    foreignKey(): string;
    macro(): any;
    /** @returns {typeof import("../base-model.js").default} */
    modelClass(): typeof import("../base-model.js").default;
    /** @returns {string} */
    name(): string;
    /** @returns {string} */
    through(): string;
}
//# sourceMappingURL=reflection.d.ts.map