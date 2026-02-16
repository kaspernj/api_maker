import {useContext} from "react"
import {QueryParamsContext} from "./location-context"

const useQueryParams = () => useContext(QueryParamsContext)

export default useQueryParams
