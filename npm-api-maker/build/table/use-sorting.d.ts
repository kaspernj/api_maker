/**
 * @param {object} args
 * @param {object} args.defaultParams
 * @param {import("../collection.js").default} args.query
 * @returns {{
 *   qParams: object
 *   searchKey: string,
 *   sortAttribute: string,
 *   sortMode: string
 * }}
 */
export default function useSorting({ defaultParams, query }: {
    defaultParams: object;
    query: import("../collection.js").default<any>;
}): {
    qParams: object;
    searchKey: string;
    sortAttribute: string;
    sortMode: string;
};
//# sourceMappingURL=use-sorting.d.ts.map