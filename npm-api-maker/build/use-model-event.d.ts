export default apiMakerUseModelEvent;
/**
 * @param {import("./base-model.js").default} model
 * @param {string} event
 * @param {function} onCallback
 * @param {object} props
 * @param {object} props.active
 * @param {number} props.debounce
 * @param {function} props.onConnected
 * @return {void}
 */
declare function apiMakerUseModelEvent(model: import("./base-model.js").default, event: string, onCallback: Function, props: {
    active: object;
    debounce: number;
    onConnected: Function;
}): void;
//# sourceMappingURL=use-model-event.d.ts.map