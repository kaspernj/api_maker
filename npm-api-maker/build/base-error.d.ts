/**
 * @typedef {object} BaseErrorArgsType
 * @property {boolean} [addResponseErrorsToErrorMessage]
 * @property {import("./base-model.js").default} [model]
 * @property {object} response
 * @property {string[]} [response.validation_errors]
 * @property {import("./error-messages.js").ErrorMessagesArgsType} [response.errors]
 */
export default class BaseError extends Error {
    static apiMakerType: string;
    /**
     * @param {string} message
     * @param {BaseErrorArgsType} [args]
     */
    constructor(message: string, args?: BaseErrorArgsType);
    apiMakerType: string;
    args: BaseErrorArgsType;
    /** @returns {string[]} */
    errorMessages(): string[];
    /** @returns {string[]} */
    errorTypes(): string[];
}
export type BaseErrorArgsType = {
    addResponseErrorsToErrorMessage?: boolean;
    model?: import("./base-model.js").default;
    response: {
        validation_errors?: string[];
        errors?: import("./error-messages.js").ErrorMessagesArgsType;
    };
};
//# sourceMappingURL=base-error.d.ts.map