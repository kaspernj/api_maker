import Collection from "./collection.mjs"
import {digg} from "diggerize"
import {memo, useEffect} from "react"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import useCollection from "./use-collection"
import useShape from "set-state-compare/src/use-shape.js"

const CollectionLoader = ({component, restProps}) => {
  const s = useShape(restProps)
  const useCollectionResult = useCollection(props)
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

  useEffect(() => {
    const componentShape = digg(s.m.component, "shape")

    componentShape.set(s.m.useCollectionResult)
  }, cacheParts)

  return null
}

CollectionLoader.propTypes = PropTypesExact({
  abilities: PropTypes.object,
  collection: PropTypes.instanceOf(Collection),
  defaultParams: PropTypes.object,
  groupBy: PropTypes.array,
  modelClass: PropTypes.func.isRequired,
  noRecordsAvailableContent: PropTypes.func,
  noRecordsFoundContent: PropTypes.func,
  onModelsLoaded: PropTypes.func,
  pagination: PropTypes.bool.isRequired,
  preloads: PropTypes.array.isRequired,
  queryMethod: PropTypes.func,
  queryName: PropTypes.string,
  select: PropTypes.object,
  selectColumns: PropTypes.object
})

export default memo(CollectionLoader)
