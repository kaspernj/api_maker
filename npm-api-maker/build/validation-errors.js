// @ts-check
import * as inflection from "inflection";
import { digg, digs } from "diggerize";
import modelClassRequire from "./model-class-require.js";
class ValidationError {
    /**
     * @param {object} args
     * @param {string} args.attribute_name
     * @param {string} args.attribute_type
     * @param {string[]} args.error_messages
     * @param {string} args.input_name
     * @param {string} args.model_name
     */
    constructor(args) {
        this.attributeName = digg(args, "attribute_name");
        this.attributeType = digg(args, "attribute_type");
        this.errorMessages = digg(args, "error_messages");
        this.errorTypes = digg(args, "error_types");
        this.inputName = args.input_name;
        this.handled = false;
        this.modelName = digg(args, "model_name");
    }
    /**
     * @param {string} attributeName
     * @param {string} inputName
     * @returns {boolean}
     */
    matchesAttributeAndInputName(attributeName, inputName) {
        if (this.getInputName() == inputName)
            return true;
        if (!attributeName)
            return false;
        // A relationship column ends with "_id". We should try for validation errors on an attribute without the "_id" as well
        const attributeNameIdMatch = attributeName.match(/^(.+)Id$/);
        if (!attributeNameIdMatch)
            return false;
        const attributeNameWithoutId = inflection.underscore(attributeNameIdMatch[1]);
        const attributeUnderScoreName = inflection.underscore(attributeName);
        const inputNameWithoutId = inputName.replace(`[${attributeUnderScoreName}]`, `[${attributeNameWithoutId}]`);
        if (this.getInputName() == inputNameWithoutId)
            return true;
        return false;
    }
    /** @returns {string} */
    getAttributeName = () => digg(this, "attributeName");
    /** @returns {string[]} */
    getErrorMessages = () => digg(this, "errorMessages");
    /** @returns {string[]} */
    getFullErrorMessages() {
        const { attributeType } = digs(this, "attributeType");
        if (attributeType == "base") {
            return this.getErrorMessages();
        }
        else {
            const fullErrorMessages = [];
            for (const errorMessage of this.getErrorMessages()) {
                const attributeHumanName = this.getModelClass().humanAttributeName(this.getAttributeName());
                fullErrorMessages.push(`${attributeHumanName} ${errorMessage}`);
            }
            return fullErrorMessages;
        }
    }
    /** @returns {string} */
    getHandled = () => digg(this, "handled");
    /** @returns {string} */
    getInputName = () => digg(this, "inputName");
    /** @returns {typeof import("./base-model.js").default} */
    getModelClass() {
        const modelName = inflection.classify(digg(this, "modelName"));
        return modelClassRequire(modelName);
    }
    /** @returns {void} */
    setHandled() {
        this.handled = true;
    }
}
class ValidationErrors {
    constructor(args) {
        this.rootModel = digg(args, "model");
        this.validationErrors = digg(args, "validationErrors").map((validationError) => new ValidationError(validationError));
    }
    getErrorMessage() {
        const fullErrorMessages = [];
        for (const validationError of this.validationErrors) {
            for (const fullErrorMessage of validationError.getFullErrorMessages()) {
                fullErrorMessages.push(fullErrorMessage);
            }
        }
        return fullErrorMessages.join(". ");
    }
    getValidationErrors = () => this.validationErrors;
    getValidationErrorsForInput({ attribute, inputName, onMatchValidationError }) {
        const validationErrors = this.validationErrors.filter((validationError) => {
            if (onMatchValidationError) {
                return onMatchValidationError(validationError);
            }
            else {
                return validationError.matchesAttributeAndInputName(attribute, inputName);
            }
        });
        validationErrors.map((validationError) => validationError.setHandled());
        return validationErrors;
    }
    getUnhandledErrorMessage() {
        const unhandledValidationErrors = this.validationErrors.filter((validationError) => !validationError.getHandled());
        if (unhandledValidationErrors.length > 0) {
            const unhandledValidationErrorMessages = [];
            for (const unhandledValidationError of unhandledValidationErrors) {
                for (const errorMessage of unhandledValidationError.getFullErrorMessages()) {
                    unhandledValidationErrorMessages.push(errorMessage);
                }
            }
            return unhandledValidationErrorMessages.join(". ");
        }
    }
}
export { ValidationError, ValidationErrors };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGlvbi1lcnJvcnMuanMiLCJzb3VyY2VSb290IjoiL3NyYy8iLCJzb3VyY2VzIjpbInZhbGlkYXRpb24tZXJyb3JzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVk7QUFFWixPQUFPLEtBQUssVUFBVSxNQUFNLFlBQVksQ0FBQTtBQUN4QyxPQUFPLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBQyxNQUFNLFdBQVcsQ0FBQTtBQUNwQyxPQUFPLGlCQUFpQixNQUFNLDBCQUEwQixDQUFBO0FBRXhELE1BQU0sZUFBZTtJQUVuQjs7Ozs7OztPQU9HO0lBQ0gsWUFBWSxJQUFJO1FBQ2QsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUE7UUFDakQsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUE7UUFDakQsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUE7UUFDakQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFBO1FBQzNDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQTtRQUNoQyxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQTtRQUNwQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUE7SUFDM0MsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCw0QkFBNEIsQ0FBQyxhQUFhLEVBQUUsU0FBUztRQUNuRCxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxTQUFTO1lBQUUsT0FBTyxJQUFJLENBQUE7UUFDakQsSUFBSSxDQUFDLGFBQWE7WUFBRSxPQUFPLEtBQUssQ0FBQTtRQUVoQyx1SEFBdUg7UUFDdkgsTUFBTSxvQkFBb0IsR0FBRyxhQUFhLENBQUMsS0FB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d0IsQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLENBQUM7b0JBQzNFLGdDQUFnQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTtnQkFDckQsQ0FBQztZQUNILENBQUM7WUFFRCxPQUFPLGdDQUFnQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNwRCxDQUFDO0lBQ0gsQ0FBQztDQUNGO0FBRUQsT0FBTyxFQUNMLGVBQWUsRUFDZixnQkFBZ0IsRUFDakIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIEB0cy1jaGVja1xuXG5pbXBvcnQgKiBhcyBpbmZsZWN0aW9uIGZyb20gXCJpbmZsZWN0aW9uXCJcbmltcG9ydCB7ZGlnZywgZGlnc30gZnJvbSBcImRpZ2dlcml6ZVwiXG5pbXBvcnQgbW9kZWxDbGFzc1JlcXVpcmUgZnJvbSBcIi4vbW9kZWwtY2xhc3MtcmVxdWlyZS5qc1wiXG5cbmNsYXNzIFZhbGlkYXRpb25FcnJvciB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGFkZGVkLWJsb2Nrc1xuXG4gIC8qKlxuICAgKiBAcGFyYW0ge29iamVjdH0gYXJnc1xuICAgKiBAcGFyYW0ge3N0cmluZ30gYXJncy5hdHRyaWJ1dGVfbmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXJncy5hdHRyaWJ1dGVfdHlwZVxuICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBhcmdzLmVycm9yX21lc3NhZ2VzXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcmdzLmlucHV0X25hbWVcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFyZ3MubW9kZWxfbmFtZVxuICAgKi9cbiAgY29uc3RydWN0b3IoYXJncykge1xuICAgIHRoaXMuYXR0cmlidXRlTmFtZSA9IGRpZ2coYXJncywgXCJhdHRyaWJ1dGVfbmFtZVwiKVxuICAgIHRoaXMuYXR0cmlidXRlVHlwZSA9IGRpZ2coYXJncywgXCJhdHRyaWJ1dGVfdHlwZVwiKVxuICAgIHRoaXMuZXJyb3JNZXNzYWdlcyA9IGRpZ2coYXJncywgXCJlcnJvcl9tZXNzYWdlc1wiKVxuICAgIHRoaXMuZXJyb3JUeXBlcyA9IGRpZ2coYXJncywgXCJlcnJvcl90eXBlc1wiKVxuICAgIHRoaXMuaW5wdXROYW1lID0gYXJncy5pbnB1dF9uYW1lXG4gICAgdGhpcy5oYW5kbGVkID0gZmFsc2VcbiAgICB0aGlzLm1vZGVsTmFtZSA9IGRpZ2coYXJncywgXCJtb2RlbF9uYW1lXCIpXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGF0dHJpYnV0ZU5hbWVcbiAgICogQHBhcmFtIHtzdHJpbmd9IGlucHV0TmFtZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIG1hdGNoZXNBdHRyaWJ1dGVBbmRJbnB1dE5hbWUoYXR0cmlidXRlTmFtZSwgaW5wdXROYW1lKSB7XG4gICAgaWYgKHRoaXMuZ2V0SW5wdXROYW1lKCkgPT0gaW5wdXROYW1lKSByZXR1cm4gdHJ1ZVxuICAgIGlmICghYXR0cmlidXRlTmFtZSkgcmV0dXJuIGZhbHNlXG5cbiAgICAvLyBBIHJlbGF0aW9uc2hpcCBjb2x1bW4gZW5kcyB3aXRoIFwiX2lkXCIuIFdlIHNob3VsZCB0cnkgZm9yIHZhbGlkYXRpb24gZXJyb3JzIG9uIGFuIGF0dHJpYnV0ZSB3aXRob3V0IHRoZSBcIl9pZFwiIGFzIHdlbGxcbiAgICBjb25zdCBhdHRyaWJ1dGVOYW1lSWRNYXRjaCA9IGF0dHJpYnV0ZU5hbWUubWF0Y2goL14oLispSWQkLylcbiAgICBpZiAoIWF0dHJpYnV0ZU5hbWVJZE1hdGNoKSByZXR1cm4gZmFsc2VcblxuICAgIGNvbnN0IGF0dHJpYnV0ZU5hbWVXaXRob3V0SWQgPSBpbmZsZWN0aW9uLnVuZGVyc2NvcmUoYXR0cmlidXRlTmFtZUlkTWF0Y2hbMV0pXG4gICAgY29uc3QgYXR0cmlidXRlVW5kZXJTY29yZU5hbWUgPSBpbmZsZWN0aW9uLnVuZGVyc2NvcmUoYXR0cmlidXRlTmFtZSlcbiAgICBjb25zdCBpbnB1dE5hbWVXaXRob3V0SWQgPSBpbnB1dE5hbWUucmVwbGFjZShgWyR7YXR0cmlidXRlVW5kZXJTY29yZU5hbWV9XWAsIGBbJHthdHRyaWJ1dGVOYW1lV2l0aG91dElkfV1gKVxuXG4gICAgaWYgKHRoaXMuZ2V0SW5wdXROYW1lKCkgPT0gaW5wdXROYW1lV2l0aG91dElkKSByZXR1cm4gdHJ1ZVxuXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICAvKiogQHJldHVybnMge3N0cmluZ30gKi9cbiAgZ2V0QXR0cmlidXRlTmFtZSA9ICgpID0+IGRpZ2codGhpcywgXCJhdHRyaWJ1dGVOYW1lXCIpXG5cbiAgLyoqIEByZXR1cm5zIHtzdHJpbmdbXX0gKi9cbiAgZ2V0RXJyb3JNZXNzYWdlcyA9ICgpID0+IGRpZ2codGhpcywgXCJlcnJvck1lc3NhZ2VzXCIpXG5cbiAgLyoqIEByZXR1cm5zIHtzdHJpbmdbXX0gKi9cbiAgZ2V0RnVsbEVycm9yTWVzc2FnZXMoKSB7XG4gICAgY29uc3Qge2F0dHJpYnV0ZVR5cGV9ID0gZGlncyh0aGlzLCBcImF0dHJpYnV0ZVR5cGVcIilcblxuICAgIGlmIChhdHRyaWJ1dGVUeXBlID09IFwiYmFzZVwiKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRFcnJvck1lc3NhZ2VzKClcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZnVsbEVycm9yTWVzc2FnZXMgPSBbXVxuXG4gICAgICBmb3IgKGNvbnN0IGVycm9yTWVzc2FnZSBvZiB0aGlzLmdldEVycm9yTWVzc2FnZXMoKSkge1xuICAgICAgICBjb25zdCBhdHRyaWJ1dGVIdW1hbk5hbWUgPSB0aGlzLmdldE1vZGVsQ2xhc3MoKS5odW1hbkF0dHJpYnV0ZU5hbWUodGhpcy5nZXRBdHRyaWJ1dGVOYW1lKCkpXG4gICAgICAgIGZ1bGxFcnJvck1lc3NhZ2VzLnB1c2goYCR7YXR0cmlidXRlSHVtYW5OYW1lfSAke2Vycm9yTWVzc2FnZX1gKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZnVsbEVycm9yTWVzc2FnZXNcbiAgICB9XG4gIH1cblxuICAvKiogQHJldHVybnMge3N0cmluZ30gKi9cbiAgZ2V0SGFuZGxlZCA9ICgpID0+IGRpZ2codGhpcywgXCJoYW5kbGVkXCIpXG5cbiAgLyoqIEByZXR1cm5zIHtzdHJpbmd9ICovXG4gIGdldElucHV0TmFtZSA9ICgpID0+IGRpZ2codGhpcywgXCJpbnB1dE5hbWVcIilcblxuICAvKiogQHJldHVybnMge3R5cGVvZiBpbXBvcnQoXCIuL2Jhc2UtbW9kZWwuanNcIikuZGVmYXVsdH0gKi9cbiAgZ2V0TW9kZWxDbGFzcygpIHtcbiAgICBjb25zdCBtb2RlbE5hbWUgPSBpbmZsZWN0aW9uLmNsYXNzaWZ5KGRpZ2codGhpcywgXCJtb2RlbE5hbWVcIikpXG5cbiAgICByZXR1cm4gbW9kZWxDbGFzc1JlcXVpcmUobW9kZWxOYW1lKVxuICB9XG5cbiAgLyoqIEByZXR1cm5zIHt2b2lkfSAqL1xuICBzZXRIYW5kbGVkKCkge1xuICAgIHRoaXMuaGFuZGxlZCA9IHRydWVcbiAgfVxufVxuXG5jbGFzcyBWYWxpZGF0aW9uRXJyb3JzIHtcbiAgY29uc3RydWN0b3IoYXJncykge1xuICAgIHRoaXMucm9vdE1vZGVsID0gZGlnZyhhcmdzLCBcIm1vZGVsXCIpXG4gICAgdGhpcy52YWxpZGF0aW9uRXJyb3JzID0gZGlnZyhhcmdzLCBcInZhbGlkYXRpb25FcnJvcnNcIikubWFwKCh2YWxpZGF0aW9uRXJyb3IpID0+IG5ldyBWYWxpZGF0aW9uRXJyb3IodmFsaWRhdGlvbkVycm9yKSlcbiAgfVxuXG4gIGdldEVycm9yTWVzc2FnZSgpIHtcbiAgICBjb25zdCBmdWxsRXJyb3JNZXNzYWdlcyA9IFtdXG5cbiAgICBmb3IgKGNvbnN0IHZhbGlkYXRpb25FcnJvciBvZiB0aGlzLnZhbGlkYXRpb25FcnJvcnMpIHtcbiAgICAgIGZvciAoY29uc3QgZnVsbEVycm9yTWVzc2FnZSBvZiB2YWxpZGF0aW9uRXJyb3IuZ2V0RnVsbEVycm9yTWVzc2FnZXMoKSkge1xuICAgICAgICBmdWxsRXJyb3JNZXNzYWdlcy5wdXNoKGZ1bGxFcnJvck1lc3NhZ2UpXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bGxFcnJvck1lc3NhZ2VzLmpvaW4oXCIuIFwiKVxuICB9XG5cbiAgZ2V0VmFsaWRhdGlvbkVycm9ycyA9ICgpID0+IHRoaXMudmFsaWRhdGlvbkVycm9yc1xuXG4gIGdldFZhbGlkYXRpb25FcnJvcnNGb3JJbnB1dCh7YXR0cmlidXRlLCBpbnB1dE5hbWUsIG9uTWF0Y2hWYWxpZGF0aW9uRXJyb3J9KSB7XG4gICAgY29uc3QgdmFsaWRhdGlvbkVycm9ycyA9IHRoaXMudmFsaWRhdGlvbkVycm9ycy5maWx0ZXIoKHZhbGlkYXRpb25FcnJvcikgPT4ge1xuICAgICAgaWYgKG9uTWF0Y2hWYWxpZGF0aW9uRXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIG9uTWF0Y2hWYWxpZGF0aW9uRXJyb3IodmFsaWRhdGlvbkVycm9yKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHZhbGlkYXRpb25FcnJvci5tYXRjaGVzQXR0cmlidXRlQW5kSW5wdXROYW1lKGF0dHJpYnV0ZSwgaW5wdXROYW1lKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICB2YWxpZGF0aW9uRXJyb3JzLm1hcCgodmFsaWRhdGlvbkVycm9yKSA9PiB2YWxpZGF0aW9uRXJyb3Iuc2V0SGFuZGxlZCgpKVxuXG4gICAgcmV0dXJuIHZhbGlkYXRpb25FcnJvcnNcbiAgfVxuXG4gIGdldFVuaGFuZGxlZEVycm9yTWVzc2FnZSgpIHtcbiAgICBjb25zdCB1bmhhbmRsZWRWYWxpZGF0aW9uRXJyb3JzID0gdGhpcy52YWxpZGF0aW9uRXJyb3JzLmZpbHRlcigodmFsaWRhdGlvbkVycm9yKSA9PiAhdmFsaWRhdGlvbkVycm9yLmdldEhhbmRsZWQoKSlcblxuICAgIGlmICh1bmhhbmRsZWRWYWxpZGF0aW9uRXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IHVuaGFuZGxlZFZhbGlkYXRpb25FcnJvck1lc3NhZ2VzID0gW11cblxuICAgICAgZm9yIChjb25zdCB1bmhhbmRsZWRWYWxpZGF0aW9uRXJyb3Igb2YgdW5oYW5kbGVkVmFsaWRhdGlvbkVycm9ycykge1xuICAgICAgICBmb3IgKGNvbnN0IGVycm9yTWVzc2FnZSBvZiB1bmhhbmRsZWRWYWxpZGF0aW9uRXJyb3IuZ2V0RnVsbEVycm9yTWVzc2FnZXMoKSkge1xuICAgICAgICAgIHVuaGFuZGxlZFZhbGlkYXRpb25FcnJvck1lc3NhZ2VzLnB1c2goZXJyb3JNZXNzYWdlKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB1bmhhbmRsZWRWYWxpZGF0aW9uRXJyb3JNZXNzYWdlcy5qb2luKFwiLiBcIilcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IHtcbiAgVmFsaWRhdGlvbkVycm9yLFxuICBWYWxpZGF0aW9uRXJyb3JzXG59XG4iXX0=