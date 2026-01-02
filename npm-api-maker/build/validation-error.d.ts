export default class ValidationError extends BaseError {
    /**
     * @param {import("./validation-errors.js").ValidationErrors} validationErrors
     * @param {object} args
     */
    constructor(validationErrors: import("./validation-errors.js").ValidationErrors, args: object);
    validationErrors: import("./validation-errors.js").ValidationErrors;
    /** @returns {import("./validation-errors.js").ValidationError[]} */
    getUnhandledErrors: () => import("./validation-errors.js").ValidationError[];
    /** @returns {import("./validation-errors.js").ValidationErrors} */
    getValidationErrors: () => import("./validation-errors.js").ValidationErrors;
    /** @returns {boolean} */
    hasUnhandledErrors: () => boolean;
    /** @returns {boolean} */
    hasValidationErrorForAttribute: (attributeName: any) => boolean;
}
import BaseError from "./base-error.js";
//# sourceMappingURL=validation-error.d.ts.map