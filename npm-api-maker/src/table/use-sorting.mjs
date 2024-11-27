import {camelize} from "inflection"

const calculateIsSortedByAttribute = ({attribute, qParams}) => {
  if (qParams.s == attribute) {
    return {
      isSortedByAttribute: true,
      sortMode: "asc"
    }
  } else if (qParams.s == `${attribute} asc`) {
    return {
      isSortedByAttribute: true,
      sortMode: "asc"
    }
  } else if (qParams.s == `${attribute} desc`) {
    return {
      isSortedByAttribute: true,
      sortMode: "desc"
    }
  } else {
    return {
      isSortedByAttribute: false,
      sortMode: null
    }
  }
}

const calculateQParams = ({defaultParams, queryParams, searchKey}) => {
  if (searchKey in queryParams) {
    return JSON.parse(queryParams[searchKey])
  } else if (defaultParams) {
    return {...defaultParams}
  }

  return {}
}

const useSorting = ({defaultParams, query}) => {
  const queryParams = useQueryParams()
  const searchKey = query.queryArgs.searchKey || "q"
  const qParams = calculateQParams({defaultParams, queryParams, searchKey})
  const matchSortParam = qParams.s?.match(/^(.+?)( asc| desc|)$/)
  const sortAttribute = matchSortParam ? camelize(matchSortParam[1], true) : null
  const sortMode = matchSortParam ? matchSortParam[2].trim() : null

  return {
    qParams,
    searchKey,
    sortAttribute,
    sortMode
  }
}

export default useSorting
