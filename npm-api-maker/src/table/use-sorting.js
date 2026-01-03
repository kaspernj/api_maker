/* eslint-disable func-style */
import {camelize} from "inflection"
import useQueryParams from "on-location-changed/build/use-query-params.js"

/**
 * @returns {object}
 */
function calculateQParams(defaultParams, queryParams, searchKey) {
  if (searchKey in queryParams) {
    return JSON.parse(queryParams[searchKey])
  } else if (defaultParams) {
    return {...defaultParams}
  }

  return {}
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
