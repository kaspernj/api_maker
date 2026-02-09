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
    console.log(`[can-can-hook-debug] devise-change reloadKey=devise:${deviseReloadKeyRef.current}`)
    loadAbilities(`devise:${deviseReloadKeyRef.current}`)
  }, [loadAbilities])

  const onResetAbilities = useCallback(() => {
    console.log("[can-can-hook-debug] onResetAbilities -> loadAbilities()")
    loadAbilities()
  }, [loadAbilities])
  const onAbilitiesLoaded = useCallback(() => {
    console.log("[can-can-hook-debug] onAbilitiesLoaded")
    s.set({lastUpdate: new Date()})
  }, [])

  const dependencyList = dependencies ?? []
  const dependencyKey = useMemo(() => dependencyListKey(dependencyList), dependencyList)
  const hasCustomDependencies = dependencies !== undefined

  useEffect(() => {
    // `loadAbilities` is intentionally stable; this effect is driven by dependency inputs.
    console.log(`[can-can-hook-debug] effect hasCustomDependencies=${String(hasCustomDependencies)}; dependencyKey=${dependencyKey}`)
    if (hasCustomDependencies) {
      loadAbilities(dependencyKey)
    } else {
      loadAbilities()
    }
  }, [dependencyKey, hasCustomDependencies])

  useEventEmitter(Devise.events(), "onDeviseSignIn", onDeviseChange)
  useEventEmitter(Devise.events(), "onDeviseSignOut", onDeviseChange)
  useEventEmitter(CanCan.current().events, "onAbilitiesLoaded", onAbilitiesLoaded)
  useEventEmitter(CanCan.current().events, "onResetAbilities", onResetAbilities)

  return s.s.canCan
}
