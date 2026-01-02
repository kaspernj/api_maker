import { camelize } from "inflection";
import useQueryParams from "on-location-changed/build/use-query-params.js";
/**
 * @returns {object}
 */
function calculateQParams(defaultParams, queryParams, searchKey) {
    if (searchKey in queryParams) {
        return JSON.parse(queryParams[searchKey]);
    }
    else if (defaultParams) {
        return { ...defaultParams };
    }
    return {};
}
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
export default function useSorting({ defaultParams, query }) {
    const queryParams = useQueryParams();
    const searchKey = query.queryArgs.searchKey || "q";
    const qParams = calculateQParams(defaultParams, queryParams, searchKey);
    let matchSortParam;
    if (typeof qParams.s == "string") {
        matchSortParam = qParams.s?.match(/^(.+?)( asc| desc|)$/);
    }
    const sortAttribute = matchSortParam ? camelize(matchSortParam[1], true) : null;
    const sortMode = matchSortParam ? matchSortParam[2].trim() : null;
    return {
        qParams,
        searchKey,
        sortAttribute,
        sortMode
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlLXNvcnRpbmcuanMiLCJzb3VyY2VSb290IjoiL3NyYy8iLCJzb3VyY2VzIjpbInRhYmxlL3VzZS1zb3J0aW5nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxZQUFZLENBQUE7QUFDbkMsT0FBTyxjQUFjLE1BQU0sK0NBQStDLENBQUE7QUFFMUU7O0dBRUc7QUFDSCxTQUFTLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxXQUFXLEVBQUUsU0FBUztJQUM3RCxJQUFJLFNBQVMsSUFBSSxXQUFXLEVBQUUsQ0FBQztRQUM3QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUE7SUFDM0MsQ0FBQztTQUFNLElBQUksYUFBYSxFQUFFLENBQUM7UUFDekIsT0FBTyxFQUFDLEdBQUcsYUFBYSxFQUFDLENBQUE7SUFDM0IsQ0FBQztJQUVELE9BQU8sRUFBRSxDQUFBO0FBQ1gsQ0FBQztBQUVEOzs7Ozs7Ozs7O0dBVUc7QUFDSCxNQUFNLENBQUMsT0FBTyxVQUFVLFVBQVUsQ0FBQyxFQUFDLGFBQWEsRUFBRSxLQUFLLEVBQUM7SUFDdkQsTUFBTSxXQUFXLEdBQUcsY0FBYyxFQUFFLENBQUE7SUFDcEMsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFTLElBQUksR0FBRyxDQUFBO0lBQ2xELE1BQU0sT0FBTyxHQUFHLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUE7SUFDdkUsSUFBSSxjQUFjLENBQUE7SUFFbEIsSUFBSSxPQUFPLE9BQU8sQ0FBQyxDQUFDLElBQUksUUFBUSxFQUFFLENBQUM7UUFDakMsY0FBYyxHQUFHLE9BQU8sQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUE7SUFDM0QsQ0FBQztJQUVELE1BQU0sYUFBYSxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFBO0lBQy9FLE1BQU0sUUFBUSxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUE7SUFFakUsT0FBTztRQUNMLE9BQU87UUFDUCxTQUFTO1FBQ1QsYUFBYTtRQUNiLFFBQVE7S0FDVCxDQUFBO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y2FtZWxpemV9IGZyb20gXCJpbmZsZWN0aW9uXCJcbmltcG9ydCB1c2VRdWVyeVBhcmFtcyBmcm9tIFwib24tbG9jYXRpb24tY2hhbmdlZC9idWlsZC91c2UtcXVlcnktcGFyYW1zLmpzXCJcblxuLyoqXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxuICovXG5mdW5jdGlvbiBjYWxjdWxhdGVRUGFyYW1zKGRlZmF1bHRQYXJhbXMsIHF1ZXJ5UGFyYW1zLCBzZWFyY2hLZXkpIHtcbiAgaWYgKHNlYXJjaEtleSBpbiBxdWVyeVBhcmFtcykge1xuICAgIHJldHVybiBKU09OLnBhcnNlKHF1ZXJ5UGFyYW1zW3NlYXJjaEtleV0pXG4gIH0gZWxzZSBpZiAoZGVmYXVsdFBhcmFtcykge1xuICAgIHJldHVybiB7Li4uZGVmYXVsdFBhcmFtc31cbiAgfVxuXG4gIHJldHVybiB7fVxufVxuXG4vKipcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzXG4gKiBAcGFyYW0ge29iamVjdH0gYXJncy5kZWZhdWx0UGFyYW1zXG4gKiBAcGFyYW0ge2ltcG9ydChcIi4uL2NvbGxlY3Rpb24uanNcIikuZGVmYXVsdH0gYXJncy5xdWVyeVxuICogQHJldHVybnMge3tcbiAqICAgcVBhcmFtczogb2JqZWN0XG4gKiAgIHNlYXJjaEtleTogc3RyaW5nLFxuICogICBzb3J0QXR0cmlidXRlOiBzdHJpbmcsXG4gKiAgIHNvcnRNb2RlOiBzdHJpbmdcbiAqIH19XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHVzZVNvcnRpbmcoe2RlZmF1bHRQYXJhbXMsIHF1ZXJ5fSkge1xuICBjb25zdCBxdWVyeVBhcmFtcyA9IHVzZVF1ZXJ5UGFyYW1zKClcbiAgY29uc3Qgc2VhcmNoS2V5ID0gcXVlcnkucXVlcnlBcmdzLnNlYXJjaEtleSB8fCBcInFcIlxuICBjb25zdCBxUGFyYW1zID0gY2FsY3VsYXRlUVBhcmFtcyhkZWZhdWx0UGFyYW1zLCBxdWVyeVBhcmFtcywgc2VhcmNoS2V5KVxuICBsZXQgbWF0Y2hTb3J0UGFyYW1cblxuICBpZiAodHlwZW9mIHFQYXJhbXMucyA9PSBcInN0cmluZ1wiKSB7XG4gICAgbWF0Y2hTb3J0UGFyYW0gPSBxUGFyYW1zLnM/Lm1hdGNoKC9eKC4rPykoIGFzY3wgZGVzY3wpJC8pXG4gIH1cblxuICBjb25zdCBzb3J0QXR0cmlidXRlID0gbWF0Y2hTb3J0UGFyYW0gPyBjYW1lbGl6ZShtYXRjaFNvcnRQYXJhbVsxXSwgdHJ1ZSkgOiBudWxsXG4gIGNvbnN0IHNvcnRNb2RlID0gbWF0Y2hTb3J0UGFyYW0gPyBtYXRjaFNvcnRQYXJhbVsyXS50cmltKCkgOiBudWxsXG5cbiAgcmV0dXJuIHtcbiAgICBxUGFyYW1zLFxuICAgIHNlYXJjaEtleSxcbiAgICBzb3J0QXR0cmlidXRlLFxuICAgIHNvcnRNb2RlXG4gIH1cbn1cbiJdfQ==