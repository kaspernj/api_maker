import CanCan from "./can-can.js"
import {useCallback, useMemo} from "react"
import useCurrentUser from "./use-current-user.js"
import useEventEmitter from "./use-event-emitter.js"
import useShape from "set-state-compare/build/use-shape.js"

/**
 * @param {function() : Array} abilitiesCallback
 * @param {Array} [dependencies]
 * @returns {CanCan}
 */
export default function useCanCan(abilitiesCallback, dependencies) {
  const currentUser = useCurrentUser()
  const s = useShape({abilitiesCallback})

  s.useStates({
    canCan: null,
    lastUpdate: () => new Date()
  })

  const loadAbilities = useCallback(async () => {
    const canCan = CanCan.current()
    const abilities = s.p.abilitiesCallback()

    await canCan.loadAbilities(abilities)

    s.set({canCan, lastUpdate: new Date()})
  }, [])

  const onResetAbilities = useCallback(() => {
    s.set({canCan: null}, {silent: true})
    loadAbilities()
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

  if (!dependencies) {
    // @ts-expect-error
    dependencies = [currentUser?.id()]
  }

  useMemo(() => {
    loadAbilitiesOnNew()
  }, dependencies)

  useEventEmitter(CanCan.current().events, "onResetAbilities", onResetAbilities)

  return s.s.canCan
}
