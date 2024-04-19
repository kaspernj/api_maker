import CanCan from "./can-can.mjs"
import {useCallback, useEffect, useState} from "react"
import useCurrentUser from "./use-current-user.mjs"
import useShape from "set-state-compare/src/use-shape.js"

const useCanCan = (abilitiesCallback, dependencies) => {
  const currentUser = useCurrentUser()
  const s = useShape({abilitiesCallback})
  const [canCan, setCanCan] = useState()

  if (!dependencies) {
    dependencies = [currentUser?.id()]
  }

  const loadAbilities = useCallback(async () => {
    const canCan = CanCan.current()
    const abilities = s.p.abilitiesCallback()

    await canCan.loadAbilities(abilities)

    setCanCan(canCan)
  }, [])

  const onResetAbilities = useCallback(() => {
    setCanCan(undefined)
    loadAbilities()
  }, [])

  useEffect(() => {
    setCanCan(undefined)
    loadAbilities()
  }, dependencies)

  useEffect(() => {
    CanCan.current().events.addListener("onResetAbilities", onResetAbilities)

    return () => {
      CanCan.current().events.removeListener("onResetAbilities", onResetAbilities)
    }
  }, [])

  return canCan
}

export default useCanCan
