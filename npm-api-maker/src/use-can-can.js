import CanCan from "./can-can"
import {useCallback, useMemo, useState} from "react"
import useCurrentUser from "./use-current-user"
import useEventEmitter from "./use-event-emitter"
import useShape from "set-state-compare/src/use-shape"

const useCanCan = (abilitiesCallback, dependencies) => {
  const currentUser = useCurrentUser()
  const s = useShape({abilitiesCallback})

  s.useStates({
    canCan: null,
    lastUpdate: new Date()
  })

  if (!dependencies) {
    dependencies = [currentUser?.id()]
  }

  const loadAbilities = useCallback(async () => {
    const canCan = CanCan.current()
    const abilities = s.p.abilitiesCallback()

    await canCan.loadAbilities(abilities)

    s.set({canCan, lastUpdate: new Date()})
  }, [])

  const onResetAbilities = useCallback(async () => {
    s.set({canCan: null}, {silent: true})
    await loadAbilities()
  }, [])

  const loadAbilitiesOnNew = useCallback(async () => {
    const canCan = s.s.canCan

    s.set({canCan: null}, {silent: true})

    if (canCan) {
      await canCan?.resetAbilities()
    } else {
      await loadAbilities()
    }
  }, [])

  useMemo(() => {
    loadAbilitiesOnNew()
  }, dependencies)

  useEventEmitter(CanCan.current().events, "onResetAbilities", onResetAbilities)

  return s.s.canCan
}

export default useCanCan
