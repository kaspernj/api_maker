/* eslint-disable jest/require-hook */
import {useCallback, useEffect, useMemo} from "react"
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
 * @param {object} [options]
 * @param {boolean} [options.debug]
 * @returns {CanCan}
 */
export default function useCanCan(abilitiesCallback, dependencies = undefined, options = {}) {
  const {debug = false} = options
  const s = useShape({abilitiesCallback})

  s.meta.canCan ||= CanCan.current()
  s.meta.debug = debug
  s.meta.debugToken ||= Symbol("use-can-can-debug")
  s.meta.deviseReloadKey ||= 0

  s.useStates({
    lastUpdate: () => new Date()
  })

  const loadAbilities = useCallback(async (reloadKey) => {
    const abilities = s.p.abilitiesCallback()

    if (reloadKey === undefined) {
      await s.m.canCan.loadAbilities(abilities)
    } else {
      await s.m.canCan.reloadAbilities(abilities, reloadKey)
    }

    s.set({lastUpdate: new Date()})
  }, [])

  const onDeviseChange = useCallback(() => {
    s.meta.deviseReloadKey += 1

    if (s.m.debug) {
      console.log(`[useCanCan] devise-change reloadKey=devise:${s.meta.deviseReloadKey}`)
    }
    loadAbilities(`devise:${s.meta.deviseReloadKey}`)
  }, [])

  const onResetAbilities = useCallback(() => {
    if (s.m.debug) {
      console.log("[useCanCan] onResetAbilities -> loadAbilities()")
    }
    loadAbilities()
  }, [])

  const onAbilitiesLoaded = useCallback(() => {
    if (s.m.debug) {
      console.log("[useCanCan] onAbilitiesLoaded")
    }
    s.set({lastUpdate: new Date()})
  }, [])

  const dependencyList = dependencies ?? []
  const dependencyKey = useMemo(() => dependencyListKey(dependencyList), dependencyList)
  const hasCustomDependencies = dependencies !== undefined

  useEffect(() => {
    s.m.canCan.setDebug(s.meta.debugToken, debug)

    return () => {
      s.m.canCan.setDebug(s.meta.debugToken, false)
    }
  }, [debug])

  useEffect(() => {
    // `loadAbilities` is intentionally stable; this effect is driven by dependency inputs.
    if (debug) {
      console.log(`[useCanCan] effect hasCustomDependencies=${String(hasCustomDependencies)}; dependencyKey=${dependencyKey}`)
    }
    if (hasCustomDependencies) {
      loadAbilities(dependencyKey)
    } else {
      loadAbilities()
    }
  }, [dependencyKey, hasCustomDependencies])

  useEventEmitter(Devise.events(), "onDeviseSignIn", onDeviseChange)
  useEventEmitter(Devise.events(), "onDeviseSignOut", onDeviseChange)
  useEventEmitter(s.m.canCan.events, "onAbilitiesLoaded", onAbilitiesLoaded)
  useEventEmitter(s.m.canCan.events, "onResetAbilities", onResetAbilities)

  return s.s.canCan
}
