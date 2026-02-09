import {ShapeHook, useShapeHook} from "set-state-compare"
import {useEffect, useMemo} from "react"
import CanCan from "./can-can.js"
import Devise from "./devise.js"
import useEventEmitter from "ya-use-event-emitter"

class UseCanCanClass extends ShapeHook {
  constructor(props) {
    super(props)
    this.canCan = CanCan.current()
    this.debugToken = Symbol("use-can-can-debug")
    this.deviseReloadKey = 0
    this.loadedWithCustomDependencies = false
    this.dependencyKeyMap = new WeakMap()
    this.dependencyKeyNextId = 1
  }

  dependencyKeyFor(value) {
    if (value === null) return "null"
    if (value === undefined) return "undefined"

    const valueType = typeof value

    if (valueType !== "object" && valueType !== "function") {
      return `${valueType}:${String(value)}`
    }

    if (!this.dependencyKeyMap.has(value)) {
      this.dependencyKeyMap.set(value, this.dependencyKeyNextId)
      this.dependencyKeyNextId += 1
    }

    return `${valueType}:ref:${this.dependencyKeyMap.get(value)}`
  }

  dependencyListKey(list) {
    if (!Array.isArray(list)) return this.dependencyKeyFor(list)

    return list.map((value) => this.dependencyKeyFor(value)).join("|")
  }

  loadAbilities = async (reloadKey) => {
    const abilities = this.p.abilitiesCallback()

    if (reloadKey === undefined) {
      await this.canCan.loadAbilities(abilities)
    } else {
      await this.canCan.reloadAbilities(abilities, reloadKey)
    }

    this.setState({lastUpdate: new Date()})
  }

  onDeviseChange = () => {
    this.deviseReloadKey += 1

    if (this.p.debug) {
      console.log(`[useCanCan] devise-change reloadKey=devise:${this.deviseReloadKey}`)
    }

    this.loadAbilities(`devise:${this.deviseReloadKey}`)
  }

  onResetAbilities = () => {
    if (this.p.debug) {
      console.log("[useCanCan] onResetAbilities -> loadAbilities()")
    }

    this.loadAbilities()
  }

  onAbilitiesLoaded = () => {
    if (this.p.debug) {
      console.log("[useCanCan] onAbilitiesLoaded")
    }

    this.setState({lastUpdate: new Date()})
  }

  setup() {
    this.useStates({
      lastUpdate: () => new Date()
    })

    const {debug, dependencies} = this.p
    const dependencyList = dependencies ?? []
    const dependencyKey = useMemo(() => this.dependencyListKey(dependencyList), dependencyList)
    const hasCustomDependencies = dependencies !== undefined

    useEffect(() => {
      const previousDebug = this.canCan.debugTokens.has(this.debugToken)
      this.canCan.setDebug(this.debugToken, debug)

      return () => {
        this.canCan.setDebug(this.debugToken, previousDebug)
      }
    }, [debug])

    useEffect(() => {
      if (debug) {
        console.log(`[useCanCan] effect hasCustomDependencies=${String(hasCustomDependencies)}; dependencyKey=${dependencyKey}`)
      }

      if (hasCustomDependencies) {
        if (this.loadedWithCustomDependencies) {
          this.loadAbilities(dependencyKey)
        } else {
          this.loadedWithCustomDependencies = true
          this.loadAbilities()
        }
      } else {
        this.loadedWithCustomDependencies = false
        this.loadAbilities()
      }
    }, [dependencyKey, hasCustomDependencies])

    useEventEmitter(Devise.events(), "onDeviseSignIn", this.onDeviseChange)
    useEventEmitter(Devise.events(), "onDeviseSignOut", this.onDeviseChange)
    useEventEmitter(this.canCan.events, "onAbilitiesLoaded", this.onAbilitiesLoaded)
    useEventEmitter(this.canCan.events, "onResetAbilities", this.onResetAbilities)
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
  const {debug = false, ...restArgs} = options
  const restArgsKeys = Object.keys(restArgs)

  if (restArgsKeys.length > 0) {
    throw new Error(`Unknown options given to useCanCan: ${restArgsKeys.join(", ")}`)
  }

  const shapeHook = useShapeHook(UseCanCanClass, {abilitiesCallback, debug, dependencies})

  return shapeHook.canCan
}
