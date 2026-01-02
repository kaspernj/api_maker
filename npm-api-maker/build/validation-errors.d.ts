export class ValidationError {
    /**
     * @param {object} args
     * @param {string} args.attribute_name
     * @param {string} args.attribute_type
     * @param {string[]} args.error_messages
     * @param {string} args.input_name
     * @param {string} args.model_name
     */
    constructor(args: {
        attribute_name: string;
        attribute_type: string;
        error_messages: string[];
        input_name: string;
        model_name: string;
    });
    attributeName: any;
    attributeType: any;
    errorMessages: any;
    errorTypes: any;
    inputName: string;
    handled: boolean;
    modelName: any;
    /**
     * @param {string} attributeName
     * @param {string} inputName
     * @returns {boolean}
     */
    matchesAttributeAndInputName(attributeName: string, inputName: string): boolean;
    /** @returns {string} */
    getAttributeName: () => string;
    /** @returns {string[]} */
    getErrorMessages: () => string[];
    /** @returns {string[]} */
    getFullErrorMessages(): string[];
    /** @returns {string} */
    getHandled: () => string;
    /** @returns {string} */
    getInputName: () => string;
    /** @returns {typeof import("./base-model.js").default} */
    getModelClass(): typeof import("./base-model.js").default;
    /** @returns {void} */
    setHandled(): void;
}
export class ValidationErrors {
    constructor(args: any);
    rootModel: any;
    validationErrors: any;
    getErrorMessage(): string;
    getValidationErrors: () => any;
    getValidationErrorsForInput({ attribute, inputName, onMatchValidationError }: {
        attribute: any;
        inputName: any;
        onMatchValidationError: any;
    }): any;
    getUnhandledErrorMessage(): string;
}
//# sourceMappingURL=validation-errors.d.ts.map