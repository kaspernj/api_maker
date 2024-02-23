import CanCan from "./can-can.mjs"
import {useCallback, useEffect, useState} from "react"
import useShape from "set-state-compare/src/use-shape.js"

const useCanCan = (abilitiesCallback, dependencies) => {
  const shape = useShape({abilitiesCallback})
  const [canCan, setCanCan] = useState()

  useEffect(() => {
    loadAbilities()
  }, dependencies)

  const loadAbilities = useCallback(async () => {
    const canCan = CanCan.current()
    const abilities = shape.props.abilitiesCallback()

    await canCan.loadAbilities(abilities)

    setCanCan(canCan)
  }, [])

  const onResetAbilities = useCallback(() => {
    setCanCan(undefined)
    loadAbilities()
  }, [])

  useEffect(() => {
    CanCan.current().events.addListener("onResetAbilities", onResetAbilities)

    return () => {
      CanCan.current().events.removeListener("onResetAbilities", onResetAbilities)
    }
  }, [])

  return canCan
}

export default useCanCan
