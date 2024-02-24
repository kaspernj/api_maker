import {digg} from "diggerize"
import {memo, useEffect} from "react"
import useCollection from "./use-collection"
import useShape from "set-state-compare/src/use-shape.js"

const CollectionLoader = (props) => {
  const s = useShape(props)
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

  s.updateMeta({useCollectionResult})

  useEffect(() => {
    const componentShape = digg(s.p.component, "shape")

    componentShape.set(s.m.useCollectionResult)
  }, cacheParts)

  return null
}

export default memo(CollectionLoader)
