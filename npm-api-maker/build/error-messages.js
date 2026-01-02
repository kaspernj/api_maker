// @ts-check
import { digg } from "diggerize";
/**
 * @typedef {Array<string | {message: string}>} ErrorMessagesArgsType
 */
/**
 * @param {object} args
 * @param {object} [args.response]
 * @param {ErrorMessagesArgsType} [args.response.errors]
 * @returns {string[]}
 */
export default function errorMessages(args) {
    if (typeof args.response == "object") {
        return digg(args, "response", "errors").map((error) => {
            if (typeof error == "string") {
                return error;
            }
            return digg(error, "message");
        });
    }
    return ["No error messages found"];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3ItbWVzc2FnZXMuanMiLCJzb3VyY2VSb290IjoiL3NyYy8iLCJzb3VyY2VzIjpbImVycm9yLW1lc3NhZ2VzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVk7QUFFWixPQUFPLEVBQUMsSUFBSSxFQUFDLE1BQU0sV0FBVyxDQUFBO0FBRTlCOztHQUVHO0FBRUg7Ozs7O0dBS0c7QUFDSCxNQUFNLENBQUMsT0FBTyxVQUFVLGFBQWEsQ0FBQyxJQUFJO0lBQ3hDLElBQUksT0FBTyxJQUFJLENBQUMsUUFBUSxJQUFJLFFBQVEsRUFBRSxDQUFDO1FBQ3JDLE9BQU8sSUFBSSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDcEQsSUFBSSxPQUFPLEtBQUssSUFBSSxRQUFRLEVBQUUsQ0FBQztnQkFDN0IsT0FBTyxLQUFLLENBQUE7WUFDZCxDQUFDO1lBRUQsT0FBTyxJQUFJLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFBO1FBQy9CLENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVELE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFBO0FBQ3BDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBAdHMtY2hlY2tcblxuaW1wb3J0IHtkaWdnfSBmcm9tIFwiZGlnZ2VyaXplXCJcblxuLyoqXG4gKiBAdHlwZWRlZiB7QXJyYXk8c3RyaW5nIHwge21lc3NhZ2U6IHN0cmluZ30+fSBFcnJvck1lc3NhZ2VzQXJnc1R5cGVcbiAqL1xuXG4vKipcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzXG4gKiBAcGFyYW0ge29iamVjdH0gW2FyZ3MucmVzcG9uc2VdXG4gKiBAcGFyYW0ge0Vycm9yTWVzc2FnZXNBcmdzVHlwZX0gW2FyZ3MucmVzcG9uc2UuZXJyb3JzXVxuICogQHJldHVybnMge3N0cmluZ1tdfVxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBlcnJvck1lc3NhZ2VzKGFyZ3MpIHtcbiAgaWYgKHR5cGVvZiBhcmdzLnJlc3BvbnNlID09IFwib2JqZWN0XCIpIHtcbiAgICByZXR1cm4gZGlnZyhhcmdzLCBcInJlc3BvbnNlXCIsIFwiZXJyb3JzXCIpLm1hcCgoZXJyb3IpID0+IHtcbiAgICAgIGlmICh0eXBlb2YgZXJyb3IgPT0gXCJzdHJpbmdcIikge1xuICAgICAgICByZXR1cm4gZXJyb3JcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRpZ2coZXJyb3IsIFwibWVzc2FnZVwiKVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gW1wiTm8gZXJyb3IgbWVzc2FnZXMgZm91bmRcIl1cbn1cbiJdfQ==