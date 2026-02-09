/* eslint-disable jest/require-hook */
import {useEffect, useMemo} from "react"
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

class UseCanCanClass {
  constructor(shape) {
    this.s = shape
    this.canCan = CanCan.current()
    this.debug = false
    this.debugToken = Symbol("use-can-can-debug")
    this.deviseReloadKey = 0
    this.abilitiesCallback = null
  }

  sync({abilitiesCallback, debug}) {
    this.abilitiesCallback = abilitiesCallback
    this.debug = debug
  }

  loadAbilities = async (reloadKey) => {
    const abilities = this.abilitiesCallback()

    if (reloadKey === undefined) {
      await this.canCan.loadAbilities(abilities)
    } else {
      await this.canCan.reloadAbilities(abilities, reloadKey)
    }

    this.s.set({lastUpdate: new Date()})
  }

  onDeviseChange = () => {
    this.deviseReloadKey += 1

    if (this.debug) {
      console.log(`[useCanCan] devise-change reloadKey=devise:${this.deviseReloadKey}`)
    }

    this.loadAbilities(`devise:${this.deviseReloadKey}`)
  }

  onResetAbilities = () => {
    if (this.debug) {
      console.log("[useCanCan] onResetAbilities -> loadAbilities()")
    }

    this.loadAbilities()
  }

  onAbilitiesLoaded = () => {
    if (this.debug) {
      console.log("[useCanCan] onAbilitiesLoaded")
    }

    this.s.set({lastUpdate: new Date()})
  }

  hook({dependencies}) {
    const dependencyList = dependencies ?? []
    const dependencyKey = useMemo(() => dependencyListKey(dependencyList), dependencyList)
    const hasCustomDependencies = dependencies !== undefined

    useEffect(() => {
      this.canCan.setDebug(this.debugToken, this.debug)

      return () => {
        this.canCan.setDebug(this.debugToken, false)
      }
    }, [this.debug])

    useEffect(() => {
      if (this.debug) {
        console.log(`[useCanCan] effect hasCustomDependencies=${String(hasCustomDependencies)}; dependencyKey=${dependencyKey}`)
      }

      if (hasCustomDependencies) {
        this.loadAbilities(dependencyKey)
      } else {
        this.loadAbilities()
      }
    }, [dependencyKey, hasCustomDependencies])

    useEventEmitter(Devise.events(), "onDeviseSignIn", this.onDeviseChange)
    useEventEmitter(Devise.events(), "onDeviseSignOut", this.onDeviseChange)
    useEventEmitter(this.canCan.events, "onAbilitiesLoaded", this.onAbilitiesLoaded)
    useEventEmitter(this.canCan.events, "onResetAbilities", this.onResetAbilities)

    return this.canCan
  }
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
  s.meta.useCanCanClass ||= new UseCanCanClass(s)
  s.meta.useCanCanClass.sync({abilitiesCallback, debug})

  s.useStates({
    lastUpdate: () => new Date()
  })

  return s.meta.useCanCanClass.hook({dependencies})
}
