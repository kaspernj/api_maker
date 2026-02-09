/* eslint-disable jest/require-hook */
import {useCallback, useEffect, useMemo, useRef} from "react"
import CanCan from "./can-can.js"
import Devise from "./devise.js"
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
 * @param {Array} [dependencies]
 * @returns {CanCan}
 */
export default function useCanCan(abilitiesCallback, dependencies = undefined) {
  const s = useShape({abilitiesCallback})

  s.useStates({
    canCan: CanCan.current(),
    lastUpdate: () => new Date()
  })

  const deviseReloadKeyRef = useRef(0)

  const loadAbilities = useCallback(async (reloadKey) => {
    const canCan = CanCan.current()
    const abilities = s.p.abilitiesCallback()

    if (reloadKey === undefined) {
      await canCan.loadAbilities(abilities)
    } else {
      await canCan.reloadAbilities(abilities, reloadKey)
    }

    s.set({lastUpdate: new Date()})
  }, [])

  const onDeviseChange = useCallback(() => {
    deviseReloadKeyRef.current += 1
    loadAbilities(`devise:${deviseReloadKeyRef.current}`)
  }, [loadAbilities])

  const onResetAbilities = useCallback(() => {
    loadAbilities()
  }, [loadAbilities])
  const onAbilitiesLoaded = useCallback(() => {
    s.set({lastUpdate: new Date()})
  }, [])

  const dependencyList = dependencies ?? []
  const dependencyKey = useMemo(() => dependencyListKey(dependencyList), dependencyList)

  useEffect(() => {
    loadAbilities(dependencyKey)
  }, [dependencyKey])

  useEventEmitter(Devise.events(), "onDeviseSignIn", onDeviseChange)
  useEventEmitter(Devise.events(), "onDeviseSignOut", onDeviseChange)
  useEventEmitter(CanCan.current().events, "onAbilitiesLoaded", onAbilitiesLoaded)
  useEventEmitter(CanCan.current().events, "onResetAbilities", onResetAbilities)

  return s.s.canCan
}
