// @ts-check
import {ShapeHook, useShapeHook} from "set-state-compare"
import {useEffect, useMemo} from "react"
import CanCan from "./can-can.js"
import Devise from "./devise.js"
import useEventEmitter from "ya-use-event-emitter"

/**
 * @typedef {object} UseCanCanProps
 * @property {() => Array<object>} abilitiesCallback
 * @property {boolean} debug
 * @property {Array<boolean | number | object | string | null | undefined> | undefined} dependencies
 */

/**
 * @typedef {object} UseCanCanState
 * @property {Date} lastUpdate
 */

/** Shape hook that keeps ability state synchronized with Devise and dependency changes. */
/** @augments {ShapeHook<UseCanCanProps, UseCanCanState>} */
class UseCanCanClass extends ShapeHook {
  state = /** @type {UseCanCanState} */ ({
    lastUpdate: new Date()
  })

  /**
   * Initializes request bookkeeping and debug state for the hook instance.
   * @param {UseCanCanProps} props
   */
  constructor(props) {
    super(props)
    this.abilitiesRequestId = 0
    this.canCan = CanCan.current()
    this.debugToken = Symbol("use-can-can-debug")
    this.deviseReloadKey = 0
    this.isHookMounted = false
    this.loadedWithCustomDependencies = false
    this.dependencyKeyMap = new WeakMap()
    this.dependencyKeyNextId = 1
  }

  /**
   * Builds a stable dependency key for one primitive or object reference.
   * @param {boolean | number | object | string | null | undefined} value
   * @returns {string}
   */
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

  /**
   * Builds one cache key for the whole dependency list.
   * @param {boolean | number | object | string | null | undefined | Array<boolean | number | object | string | null | undefined>} list
   * @returns {string}
   */
  dependencyListKey(list) {
    if (!Array.isArray(list)) return this.dependencyKeyFor(list)

    return list.map((value) => this.dependencyKeyFor(value)).join("|")
  }

  /**
   * Loads or reloads abilities and ignores stale async completions.
   * @param {string | undefined} [reloadKey]
   */
  loadAbilities = async (reloadKey) => {
    // Drop late ability reload completions after dependency changes or unmounts.
    const requestId = this.abilitiesRequestId + 1

    this.abilitiesRequestId = requestId
    const abilities = this.p.abilitiesCallback()

    if (reloadKey === undefined) {
      await this.canCan.loadAbilities(abilities)
    } else {
      await this.canCan.reloadAbilities(abilities, reloadKey)
    }

    if (!this.isHookMounted || requestId != this.abilitiesRequestId) return

    this.s.lastUpdate = new Date()
  }

  /** Reloads abilities after Devise sign-in or sign-out events. */
  onDeviseChange = () => {
    this.deviseReloadKey += 1

    if (this.p.debug) {
      console.log(`[useCanCan] devise-change reloadKey=devise:${this.deviseReloadKey}`)
    }

    this.loadAbilities(`devise:${this.deviseReloadKey}`)
  }

  /** Reloads abilities after the global ability cache is reset. */
  onResetAbilities = () => {
    if (this.p.debug) {
      console.log("[useCanCan] onResetAbilities -> loadAbilities()")
    }

    this.loadAbilities()
  }

  /** Updates hook state after abilities finish loading elsewhere. */
  onAbilitiesLoaded = () => {
    if (this.p.debug) {
      console.log("[useCanCan] onAbilitiesLoaded")
    }

    if (!this.isHookMounted) return

    this.s.lastUpdate = new Date()
  }

  /** Wires ability loading, debug state, and event subscriptions for the hook. */
  setup() {
    const {debug, dependencies} = this.p
    const dependencyList = dependencies ?? []
    const dependencyKey = useMemo(() => this.dependencyListKey(dependencyList), dependencyList)
    const hasCustomDependencies = dependencies !== undefined

    useEffect(() => {
      this.isHookMounted = true

      return () => {
        this.isHookMounted = false
        this.abilitiesRequestId += 1
      }
    }, [])

    useEffect(() => {
      this.canCan.setDebug(this.debugToken, debug)

      return () => {
        this.canCan.setDebug(this.debugToken, false)
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
