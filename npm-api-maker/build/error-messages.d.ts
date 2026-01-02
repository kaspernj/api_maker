/**
 * @typedef {Array<string | {message: string}>} ErrorMessagesArgsType
 */
/**
 * @param {object} args
 * @param {object} [args.response]
 * @param {ErrorMessagesArgsType} [args.response.errors]
 * @returns {string[]}
 */
export default function errorMessages(args: {
    response?: {
        errors?: ErrorMessagesArgsType;
    };
}): string[];
export type ErrorMessagesArgsType = Array<string | {
    message: string;
}>;
//# sourceMappingURL=error-messages.d.ts.map