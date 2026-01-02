export default useCurrentUser;
export const events: EventEmitter<string | symbol, any>;
/**
 * @param {object} props
 * @param {string} [props.scope]
 * @param {boolean} [props.withData]
 * @returns {import("./base-model.js").default}
 */
declare function useCurrentUser(props?: {
    scope?: string;
    withData?: boolean;
}): import("./base-model.js").default;
import { EventEmitter } from "eventemitter3";
//# sourceMappingURL=use-current-user.d.ts.map