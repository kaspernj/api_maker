/* eslint-disable jest/require-hook */
import {useCallback, useEffect, useMemo} from "react"
import CanCan from "./can-can.js"
import Devise from "./devise.js"
import useCurrentUser from "./use-current-user.js"
import useEventEmitter from "ya-use-event-emitter"
import useShape from "set-state-compare/build/use-shape.js"

const dependencyKeyMap = new WeakMap()
let dependencyKeyNextId = 1

const dependencyKeyFor = (value) => {
  if (value === null) return "null"
  if (value === undefined) return "undefined"

  const valueType = typeof value

  if (valueType !== "object" && valueType !== "function") {
    return `${valueType}:${String(value)}`
  }

  if (!dependencyKeyMap.has(value)) {
    dependencyKeyMap.set(value, dependencyKeyNextId)
    dependencyKeyNextId += 1
  }

  return `${valueType}:ref:${dependencyKeyMap.get(value)}`
}

const dependencyListKey = (list) => {
  if (!Array.isArray(list)) return dependencyKeyFor(list)

  return list.map((value) => dependencyKeyFor(value)).join("|")
}

/**
 * @param {function() : Array} abilitiesCallback
 * @param {Array} dependencies
 * @returns {CanCan}
 */
export default function useCanCan(abilitiesCallback, dependencies) {
  const currentUser = useCurrentUser()
  const s = useShape({abilitiesCallback})

  s.useStates({
    canCan: CanCan.current(),
    lastUpdate: () => new Date()
  })

  const loadAbilities = useCallback(async () => {
    const canCan = CanCan.current()
    const abilities = s.p.abilitiesCallback()

    await canCan.loadAbilities(abilities)

    s.set({canCan, lastUpdate: new Date()})
  }, [])

  const onResetAbilities = useCallback(() => {
    loadAbilities()
  }, [])

  const loadAbilitiesOnNew = useCallback(async (reloadKey) => {
    const canCan = CanCan.current()
    const abilities = s.p.abilitiesCallback()

    await canCan.reloadAbilities(abilities, reloadKey)

    s.set({canCan, lastUpdate: new Date()})
  }, [])

  const dependencyList = dependencies ?? [currentUser?.id()] // @ts-expect-error
  const dependencyKey = useMemo(() => dependencyListKey(dependencyList), dependencyList)

  useEffect(() => {
    loadAbilitiesOnNew(dependencyKey)
  }, [dependencyKey])

  useEventEmitter(Devise.events(), "onDeviseSignIn", loadAbilitiesOnNew)
  useEventEmitter(Devise.events(), "onDeviseSignOut", loadAbilitiesOnNew)
  useEventEmitter(CanCan.current().events, "onResetAbilities", onResetAbilities)

  return s.s.canCan
}
