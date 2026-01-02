export default ApiMakerUseCreatedEvent;
/**
 * @param {function} modelClass
 * @param {function} onCreated
 * @param {object} [args]
 * @param {boolean} [args.active]
 * @param {number} [args.debounce]
 * @param {function} [args.onConnected]
 * @returns {void}
 */
declare function ApiMakerUseCreatedEvent(modelClass: Function, onCreated: Function, args?: {
    active?: boolean;
    debounce?: number;
    onConnected?: Function;
}): void;
declare namespace ApiMakerUseCreatedEvent {
    let propTypes: any;
}
//# sourceMappingURL=use-created-event.d.ts.map