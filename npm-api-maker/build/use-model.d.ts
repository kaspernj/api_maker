export default useModel;
export type useModelArgs = {
    callback?: (arg: object) => Function;
    args?: (arg: object) => object;
    loadByQueryParam?: () => number | string;
    cacheArgs?: any[];
    match?: {
        params: object;
    };
    onDestroyed?: (ctx: {
        model: import("./base-model.js").default;
    }) => void;
    query?: import("./collection.js").default<any>;
};
/**
 * @typedef {object} useModelArgs
 * @property {(arg: object) => function} [callback]
 * @property {(arg: object) => object} [args]
 * @property {() => number|string} [loadByQueryParam]
 * @property {any[]} [cacheArgs]
 * @property {{params: object}} [match]
 * @property {(ctx: { model: import("./base-model.js").default }) => void} [onDestroyed]
 * @property {import("./collection.js").default} [query]
 */
/**
 * @param {function|object} modelClassArg
 * @param {object | function({modelClass: typeof import("./base-model.js").default}): useModelArgs} [argsArg]
 */
declare function useModel(modelClassArg: Function | object, argsArg?: object | ((arg0: {
    modelClass: typeof import("./base-model.js").default;
}) => useModelArgs)): {
    model: any;
    modelId: any;
    notFound: any;
};
//# sourceMappingURL=use-model.d.ts.map