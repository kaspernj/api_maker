import {useCallback, useMemo} from "react"
import CanCan from "./can-can.js"
import Devise from "./devise.js"
import useCurrentUser from "./use-current-user.js"
import useEventEmitter from "./use-event-emitter.js"
import useShape from "set-state-compare/build/use-shape.js"

/**
 * @param {function() : Array} abilitiesCallback
 * @param {Array} dependencies
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
    s.set({canCan: null})
    loadAbilities()
  }, [])

  const loadAbilitiesOnNew = useCallback(async () => {
    s.set({canCan: null})

    await CanCan.current().resetAbilities()
    await loadAbilities()
  }, [])

  const dependencyList = dependencies ?? [currentUser?.id()] // @ts-expect-error

  useMemo(() => {
    loadAbilitiesOnNew()
  }, dependencyList)

  useEventEmitter(Devise.events(), "onDeviseSignIn", loadAbilitiesOnNew)
  useEventEmitter(Devise.events(), "onDeviseSignOut", loadAbilitiesOnNew)
  useEventEmitter(CanCan.current().events, "onResetAbilities", onResetAbilities)

  return s.s.canCan
}
