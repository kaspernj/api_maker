import {digg} from "diggerize"
import {memo, useEffect} from "react"
import useCollection from "./use-collection"
import useShape from "set-state-compare/src/use-shape.js"

const CollectionLoader = (props) => {
  const s = useShape(props)
  const useCollectionResult = useCollection(props)

  s.updateMeta({useCollectionResult})

  useEffect(() => {
    const componentShape = digg(s.p.component, "shape")

    componentShape.set(s.m.useCollectionResult)
  }, [digg(useCollectionResult, "modelIdsCacheString")])

  return null
}

export default memo(CollectionLoader)
