// @ts-check
/* eslint-disable func-style */
import {camelize} from "inflection"
import useQueryParams from "on-location-changed/build/use-query-params.js"

/** @typedef {string | number | boolean | null | undefined} SortingParamPrimitive */
/** @typedef {Record<string, SortingParamPrimitive | object | Array<object | SortingParamPrimitive>>} SortingParams */

/**
 * @param {SortingParams | undefined} defaultParams
 * @param {SortingParams | undefined} queryParams
 * @param {string} searchKey
 * @returns {SortingParams}
 */
function calculateQParams(defaultParams, queryParams, searchKey) {
  if (queryParams && searchKey in queryParams && typeof queryParams[searchKey] == "string") {
    return /** @type {SortingParams} */ (JSON.parse(queryParams[searchKey]))
  } else if (defaultParams) {
    return {...defaultParams}
  }

  return {}
}

/**
 * @param {object} args
 * @param {SortingParams} [args.defaultParams]
 * @param {import("../collection.js").default} args.query
 * @returns {{
 *   qParams: SortingParams
 *   searchKey: string,
 *   sortAttribute: string | null,
 *   sortMode: string | null
 * }}
 */
export default function useSorting({defaultParams, query}) {
  const queryParams = useQueryParams()
  const searchKey = query.queryArgs.searchKey || "q"
  const qParams = calculateQParams(defaultParams, queryParams, searchKey)
  let matchSortParam

  if (typeof qParams.s == "string") {
    matchSortParam = qParams.s?.match(/^(.+?)( asc| desc|)$/)
  }

  const sortAttribute = matchSortParam ? camelize(matchSortParam[1], true) : null
  const sortMode = matchSortParam ? matchSortParam[2].trim() : null

  return {
    qParams,
    searchKey,
    sortAttribute,
    sortMode
  }
}
