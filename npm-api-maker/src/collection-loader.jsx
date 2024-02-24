import {digg} from "diggerize"
import {memo, useEffect} from "react"
import useCollection from "./use-collection"
import useShape from "set-state-compare/src/use-shape.js"

const CollectionLoader = (props) => {
  const shape = useShape()
  const useCollectionResult = useCollection(props)

  shape.updateMeta({useCollectionResult})

  useEffect(() => {
    const componentShape = digg(this, "props", "component", "shape")

    componentShape.set(s.s.useCollectionResult)
  }, useCollectionResult.modelIdsCacheString)

  return null
}

export default memo(CollectionLoader)
