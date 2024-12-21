import CanCan from "./can-can.mjs"
import {useCallback, useLayoutEffect, useMemo, useState} from "react"
import useCurrentUser from "./use-current-user.mjs"
import useShape from "set-state-compare/src/use-shape.js"

const useCanCan = (abilitiesCallback, dependencies) => {
  const currentUser = useCurrentUser()
  const s = useShape({abilitiesCallback})

  s.useStates({
    canCan: null
  })

  if (!dependencies) {
    dependencies = [currentUser?.id()]
  }

  const loadAbilities = useCallback(async () => {
    const canCan = CanCan.current()
    const abilities = s.p.abilitiesCallback()

    await canCan.loadAbilities(abilities)

    s.set({canCan})
  }, [])

  const onResetAbilities = useCallback(() => {
    s.set({canCan: null}, {silent: true})
    loadAbilities()
  }, [])

  useMemo(() => {
    s.set({canCan: null}, {silent: true})
    loadAbilities()
  }, dependencies)

  useLayoutEffect(() => {
    CanCan.current().events.addListener("onResetAbilities", onResetAbilities)

    return () => {
      CanCan.current().events.removeListener("onResetAbilities", onResetAbilities)
    }
  }, [])

  return s.s.canCan
}

export default useCanCan
