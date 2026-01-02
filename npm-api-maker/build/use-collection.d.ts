export default useCollection;
/**
 * @param {object} props
 * @param {Record<string, string[]>} props.abilities
 * @param {import("./collection.js").default} props.collection
 * @param {Record<string, any>} props.defaultParams
 * @param {string[]} props.groupBy
 * @param {function() : boolean} props.ifCondition
 * @param {number} props.limit
 * @param {typeof import("./base-model.js").default} props.modelClass
 * @param {function() : import("react").ReactNode} props.noRecordsAvailableContent
 * @param {function() : import("react").ReactNode} props.noRecordsFoundContent
 * @param {function() : void} props.onModelsLoaded
 * @param {boolean} props.pagination
 * @param {string[]} props.preloads
 * @param {function({query: import("./collection.js").default}) : import("./collection.js").default} props.queryMethod
 * @param {string} props.queryName
 * @param {Record<string, any>} props.ransack
 * @param {Record<string, string[]>} props.select
 * @param {Record<string, string[]>} props.selectColumns
 * @param {any[]} cacheKeys
 * @returns {{
 *   models: Array<import("./base-model.js").default>,
 *   modelIdsCacheString: Array<number|string>,
 *   overallCount: number,
 *   query: import("./collection.js").default,
 *   queryName: string,
 *   queryPerKey: string,
 *   queryQName: string,
 *   querySName: string,
 *   queryPageName: string,
 *   result: import("./result.js").default,
 *   searchParams: string[],
 *   showNoRecordsAvailableContent: false | import("react").ReactNode,
 *   showNoRecordsFoundContent: false | import("react").ReactNode
 * }}
 */
declare function useCollection(props: {
    abilities: Record<string, string[]>;
    collection: import("./collection.js").default<any>;
    defaultParams: Record<string, any>;
    groupBy: string[];
    ifCondition: () => boolean;
    limit: number;
    modelClass: typeof import("./base-model.js").default;
    noRecordsAvailableContent: () => import("react").ReactNode;
    noRecordsFoundContent: () => import("react").ReactNode;
    onModelsLoaded: () => void;
    pagination: boolean;
    preloads: string[];
    queryMethod: (arg0: {
        query: import("./collection.js").default<any>;
    }) => import("./collection.js").default<any>;
    queryName: string;
    ransack: Record<string, any>;
    select: Record<string, string[]>;
    selectColumns: Record<string, string[]>;
}, cacheKeys?: any[]): {
    models: Array<import("./base-model.js").default>;
    modelIdsCacheString: Array<number | string>;
    overallCount: number;
    query: import("./collection.js").default<any>;
    queryName: string;
    queryPerKey: string;
    queryQName: string;
    querySName: string;
    queryPageName: string;
    result: import("./result.js").default;
    searchParams: string[];
    showNoRecordsAvailableContent: false | import("react").ReactNode;
    showNoRecordsFoundContent: false | import("react").ReactNode;
};
//# sourceMappingURL=use-collection.d.ts.map