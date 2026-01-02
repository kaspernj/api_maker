export default apiMakerUseUpdatedEvent;
/**
 * @param {import("./base-model.js").default} model
 * @param {function} onUpdated
 * @param {object} props
 * @param {boolean} props.active
 * @param {number} props.debounce
 * @param {function} props.onConnected
 * @return {void}
 */
declare function apiMakerUseUpdatedEvent(model: import("./base-model.js").default, onUpdated: Function, props?: {
    active: boolean;
    debounce: number;
    onConnected: Function;
}): void;
//# sourceMappingURL=use-updated-event.d.ts.map