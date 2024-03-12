import CanCan from "./can-can.mjs"
import {useCallback, useEffect, useState} from "react"
import useCurrentUser from "./use-current-user.mjs"
import useShape from "set-state-compare/src/use-shape.js"

const useCanCan = (abilitiesCallback, dependencies) => {
  const currentUser = useCurrentUser()
  const s = useShape({abilitiesCallback})
  const [canCan, setCanCan] = useState()
  const [lastUpdate, setLastUpdate] = useState(new Date())

  if (!dependencies) {
    dependencies = [currentUser?.id()]
  }

  const loadAbilities = useCallback(async () => {
    const canCan = CanCan.current()
    await canCan.loadAbilities(s.p.abilitiesCallback())

    setCanCan(canCan)
    setLastUpdate(new Date())
  }, [])

  const onResetAbilities = useCallback(() => {
    setCanCan(undefined)
    setLastUpdate(new Date())
    loadAbilities()
  }, [])

  useEffect(() => {
    loadAbilities()
  }, dependencies)

  useEffect(() => {
    CanCan.current().events.addListener("onResetAbilities", onResetAbilities)

    return () => {
      CanCan.current().events.removeListener("onResetAbilities", onResetAbilities)
    }
  }, [])

  return {canCan, lastUpdate}
}

export default useCanCan
