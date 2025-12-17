import Collection from "./collection.js"
import {digg} from "diggerize"
import memo from ""set-state-compare/build/memo.js"
import {useMemo} from "react"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import useCollection from "./use-collection.js"
import useShape from ""set-state-compare/build/use-shape.js"

const CollectionLoader = ({component, ...restProps}) => {
  const s = useShape(restProps)
  const useCollectionResult = useCollection(restProps)
  const cachePartsKeys = [
    "modelIdsCacheString",
    "overallCount",
    "qParams",
    "queryName",
    "queryPerKey",
    "queryQName",
    "querySName",
    "queryPageName",
    "searchParams",
    "showNoRecordsAvailableContent",
    "showNoRecordsFoundContent"
  ]
  const cacheParts = []

  for(const cachePartsKey of cachePartsKeys) {
    cacheParts.push(digg(useCollectionResult, cachePartsKey))
  }

  s.updateMeta({component, useCollectionResult})

  useMemo(() => {
    s.m.component.setState(s.m.useCollectionResult)
  }, cacheParts)

  return null
}

CollectionLoader.propTypes = PropTypesExact({
  abilities: PropTypes.object,
  collection: PropTypes.instanceOf(Collection),
  component: PropTypes.object.isRequired,
  defaultParams: PropTypes.object,
  groupBy: PropTypes.array,
  modelClass: PropTypes.func.isRequired,
  noRecordsAvailableContent: PropTypes.func,
  noRecordsFoundContent: PropTypes.func,
  onModelsLoaded: PropTypes.func,
  pagination: PropTypes.bool,
  preloads: PropTypes.array,
  queryMethod: PropTypes.func,
  queryName: PropTypes.string,
  ransack: PropTypes.object,
  select: PropTypes.object,
  selectColumns: PropTypes.object
})

export default memo(CollectionLoader)
