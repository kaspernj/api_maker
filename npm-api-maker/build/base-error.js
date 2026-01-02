// @ts-check
import { dig, digg } from "diggerize";
import errorMessages from "./error-messages.js";
/**
 * @typedef {object} BaseErrorArgsType
 * @property {boolean} [addResponseErrorsToErrorMessage]
 * @property {import("./base-model.js").default} [model]
 * @property {object} response
 * @property {string[]} [response.validation_errors]
 * @property {import("./error-messages.js").ErrorMessagesArgsType} [response.errors]
 */
export default class BaseError extends Error {
    static apiMakerType = "BaseError";
    apiMakerType = "BaseError";
    /**
     * @param {string} message
     * @param {BaseErrorArgsType} [args]
     */
    constructor(message, args) {
        let messageToUse = message;
        if (args && "addResponseErrorsToErrorMessage" in args && !args.addResponseErrorsToErrorMessage) {
            messageToUse = message;
        }
        else {
            if (typeof args.response == "object" && dig(args, "response", "errors")) { // eslint-disable-line no-lonely-if
                if (message) {
                    messageToUse = `${messageToUse}: ${errorMessages(args).join(". ")}`;
                }
                else {
                    messageToUse = errorMessages(args).join(". ");
                }
            }
        }
        super(messageToUse);
        this.args = args;
        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace)
            Error.captureStackTrace(this, BaseError);
    }
    /** @returns {string[]} */
    errorMessages() {
        return errorMessages(this.args);
    }
    /** @returns {string[]} */
    errorTypes() {
        if (typeof this.args.response == "object") {
            return digg(this, "args", "response", "errors").map((error) => digg(error, "type"));
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1lcnJvci5qcyIsInNvdXJjZVJvb3QiOiIvc3JjLyIsInNvdXJjZXMiOlsiYmFzZS1lcnJvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZO0FBRVosT0FBTyxFQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUMsTUFBTSxXQUFXLENBQUE7QUFDbkMsT0FBTyxhQUFhLE1BQU0scUJBQXFCLENBQUE7QUFFL0M7Ozs7Ozs7R0FPRztBQUVILE1BQU0sQ0FBQyxPQUFPLE9BQU8sU0FBVSxTQUFRLEtBQUs7SUFDMUMsTUFBTSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUE7SUFDakMsWUFBWSxHQUFHLFdBQVcsQ0FBQTtJQUUxQjs7O09BR0c7SUFDSCxZQUFZLE9BQU8sRUFBRSxJQUFJO1FBQ3ZCLElBQUksWUFBWSxHQUFHLE9BQU8sQ0FBQTtRQUUxQixJQUFJLElBQUksSUFBSSxpQ0FBaUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsK0JBQStCLEVBQUUsQ0FBQztZQUMvRixZQUFZLEdBQUcsT0FBTyxDQUFBO1FBQ3hCLENBQUM7YUFBTSxDQUFDO1lBQ04sSUFBSSxPQUFPLElBQUksQ0FBQyxRQUFRLElBQUksUUFBUSxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxtQ0FBbUM7Z0JBQzVHLElBQUksT0FBTyxFQUFFLENBQUM7b0JBQ1osWUFBWSxHQUFHLEdBQUcsWUFBWSxLQUFLLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQTtnQkFDckUsQ0FBQztxQkFBTSxDQUFDO29CQUNOLFlBQVksR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUMvQyxDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7UUFFRCxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUE7UUFDbkIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7UUFFaEIscUZBQXFGO1FBQ3JGLElBQUksS0FBSyxDQUFDLGlCQUFpQjtZQUFFLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUE7SUFDdkUsQ0FBQztJQUVELDBCQUEwQjtJQUMxQixhQUFhO1FBQ1gsT0FBTyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ2pDLENBQUM7SUFFRCwwQkFBMEI7SUFDMUIsVUFBVTtRQUNSLElBQUksT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxRQUFRLEVBQUUsQ0FBQztZQUMxQyxPQUFPLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQTtRQUNyRixDQUFDO0lBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIEB0cy1jaGVja1xuXG5pbXBvcnQge2RpZywgZGlnZ30gZnJvbSBcImRpZ2dlcml6ZVwiXG5pbXBvcnQgZXJyb3JNZXNzYWdlcyBmcm9tIFwiLi9lcnJvci1tZXNzYWdlcy5qc1wiXG5cbi8qKlxuICogQHR5cGVkZWYge29iamVjdH0gQmFzZUVycm9yQXJnc1R5cGVcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW2FkZFJlc3BvbnNlRXJyb3JzVG9FcnJvck1lc3NhZ2VdXG4gKiBAcHJvcGVydHkge2ltcG9ydChcIi4vYmFzZS1tb2RlbC5qc1wiKS5kZWZhdWx0fSBbbW9kZWxdXG4gKiBAcHJvcGVydHkge29iamVjdH0gcmVzcG9uc2VcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nW119IFtyZXNwb25zZS52YWxpZGF0aW9uX2Vycm9yc11cbiAqIEBwcm9wZXJ0eSB7aW1wb3J0KFwiLi9lcnJvci1tZXNzYWdlcy5qc1wiKS5FcnJvck1lc3NhZ2VzQXJnc1R5cGV9IFtyZXNwb25zZS5lcnJvcnNdXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFzZUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBzdGF0aWMgYXBpTWFrZXJUeXBlID0gXCJCYXNlRXJyb3JcIlxuICBhcGlNYWtlclR5cGUgPSBcIkJhc2VFcnJvclwiXG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlXG4gICAqIEBwYXJhbSB7QmFzZUVycm9yQXJnc1R5cGV9IFthcmdzXVxuICAgKi9cbiAgY29uc3RydWN0b3IobWVzc2FnZSwgYXJncykge1xuICAgIGxldCBtZXNzYWdlVG9Vc2UgPSBtZXNzYWdlXG5cbiAgICBpZiAoYXJncyAmJiBcImFkZFJlc3BvbnNlRXJyb3JzVG9FcnJvck1lc3NhZ2VcIiBpbiBhcmdzICYmICFhcmdzLmFkZFJlc3BvbnNlRXJyb3JzVG9FcnJvck1lc3NhZ2UpIHtcbiAgICAgIG1lc3NhZ2VUb1VzZSA9IG1lc3NhZ2VcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHR5cGVvZiBhcmdzLnJlc3BvbnNlID09IFwib2JqZWN0XCIgJiYgZGlnKGFyZ3MsIFwicmVzcG9uc2VcIiwgXCJlcnJvcnNcIikpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1sb25lbHktaWZcbiAgICAgICAgaWYgKG1lc3NhZ2UpIHtcbiAgICAgICAgICBtZXNzYWdlVG9Vc2UgPSBgJHttZXNzYWdlVG9Vc2V9OiAke2Vycm9yTWVzc2FnZXMoYXJncykuam9pbihcIi4gXCIpfWBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtZXNzYWdlVG9Vc2UgPSBlcnJvck1lc3NhZ2VzKGFyZ3MpLmpvaW4oXCIuIFwiKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3VwZXIobWVzc2FnZVRvVXNlKVxuICAgIHRoaXMuYXJncyA9IGFyZ3NcblxuICAgIC8vIE1haW50YWlucyBwcm9wZXIgc3RhY2sgdHJhY2UgZm9yIHdoZXJlIG91ciBlcnJvciB3YXMgdGhyb3duIChvbmx5IGF2YWlsYWJsZSBvbiBWOClcbiAgICBpZiAoRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsIEJhc2VFcnJvcilcbiAgfVxuXG4gIC8qKiBAcmV0dXJucyB7c3RyaW5nW119ICovXG4gIGVycm9yTWVzc2FnZXMoKSB7XG4gICAgcmV0dXJuIGVycm9yTWVzc2FnZXModGhpcy5hcmdzKVxuICB9XG5cbiAgLyoqIEByZXR1cm5zIHtzdHJpbmdbXX0gKi9cbiAgZXJyb3JUeXBlcygpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuYXJncy5yZXNwb25zZSA9PSBcIm9iamVjdFwiKSB7XG4gICAgICByZXR1cm4gZGlnZyh0aGlzLCBcImFyZ3NcIiwgXCJyZXNwb25zZVwiLCBcImVycm9yc1wiKS5tYXAoKGVycm9yKSA9PiBkaWdnKGVycm9yLCBcInR5cGVcIikpXG4gICAgfVxuICB9XG59XG4iXX0=