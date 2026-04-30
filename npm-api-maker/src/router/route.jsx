// @ts-check
/* eslint-disable react/jsx-max-depth, sort-imports */
import React, {createContext, useContext, useEffect, useLayoutEffect, useMemo} from "react"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import Switch, {CurrentSwitchContext} from "./switch"
import {arrayDifferent, simpleObjectDifferent} from "set-state-compare/build/diff-utils.js"
import PropTypes from "prop-types"
import memo from "set-state-compare/build/memo.js"
import propTypesExact from "prop-types-exact"
import useI18n from "i18n-on-steroids/build/src/use-i18n.js"

const CurrentPathContext = createContext([])
const ParamsContext = createContext({})
const RequireComponentContext = createContext(null)
const RouteContext = createContext(null)
const useParams = () => useContext(ParamsContext)

/** @typedef {{params: Record<string, string>}} RouteMatch */
/** @typedef {React.ComponentType<{match: RouteMatch}>} RouteComponent */
/** @typedef {{routeDefinition: {component: string}}} RequireComponentArgs */
/** @typedef {(args: RequireComponentArgs) => RouteComponent | Promise<RouteComponent | null> | null} RequireComponent */

/**
 * @typedef {object} Props
 * @property {React.ReactNode} [children]
 * @property {string} [component]
 * @property {string} [componentPath]
 * @property {boolean} [exact]
 * @property {boolean} [fallback]
 * @property {boolean} [includeInPath]
 * @property {Function} [onMatch]
 * @property {string|RegExp} [path]
 */
/**
 * @typedef {object} State
 * @property {RouteComponent | null} Component
 * @property {boolean | null} componentNotFound
 * @property {number} lastMatchUpdate
 * @property {boolean} matches
 */
const Route = memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class Route extends ShapeComponent {
  static defaultProps = {
    exact: false,
    fallback: false,
    includeInPath: true
  }

  static propTypes = propTypesExact({
    children: PropTypes.any,
    component: PropTypes.string,
    componentPath: PropTypes.string,
    exact: PropTypes.bool,
    fallback: PropTypes.bool,
    includeInPath: PropTypes.bool,
    onMatch: PropTypes.func,
    path: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(RegExp)])
  })

  /** @type {RouteMatch | null} */
  match = null

  loadComponentRequestId = 0

  /** @type {Array<string>} */
  componentPathParts = []

  lastMatchUpdate = 0

  /** @type {Record<string, string> | null} */
  newParams = null

  /** @type {Array<string> | null} */
  pathParts = null
  state = {
    Component: null,
    componentNotFound: null,
    lastMatchUpdate: 0,
    matches: false
  }

  setup() {
    const {t} = useI18n({namespace: "js.api_maker.router.route"})
    const {path} = this.props
    const {pathsMatched, switchGroup} = useContext(CurrentSwitchContext)
    const givenRoute = useContext(RouteContext)
    const {pathShown} = switchGroup.s

    this.debug = false
    this.log(() => ({givenRoute}))
    this.t = t

    this.requireComponent = /** @type {RequireComponent | null} */ (useContext(RequireComponentContext))
    this.currentParams = /** @type {Record<string, string>} */ (useContext(ParamsContext))
    this.currentPath = /** @type {Array<string>} */ (useContext(CurrentPathContext))
    this.switchGroup = switchGroup
    this.routeParts = useMemo(() => givenRoute?.split("/"), [path, givenRoute])
    this.pathParts = useMemo(() => path?.split("/"), [path])

    this.newRouteParts = useMemo(
      () => {
        if (!path) {
          if (givenRoute == "") {
            return []
          } else {
            return this.routeParts
          }
        }

        return this.routeParts.slice(this.pathParts.length, this.routeParts.length)
      },
      [givenRoute].concat(this.pathParts)
    )

    useLayoutEffect(() => {
      this.loadMatches()
    }, [givenRoute, path, pathsMatched])

    useEffect(() => {
      if (this.hasSwitchMatch() && !this.s.Component && this.s.matches) {
        if (this.props.onMatch) {
          this.props.onMatch()
        }

        if (!this.props.children && (this.props.path || this.props.component || this.props.componentPath)) {
          this.loadComponent()
        }
      }
      return () => {
        this.loadComponentRequestId += 1
      }
    }, [path, pathShown, this.s.matches])
  }

  hasSwitchMatch = () => this.switchGroup.s.pathShown && this.switchGroup.s.pathShown == this.pathId()

  pathId() {
    const {fallback} = this.p
    const {path} = this.props
    let pathId

    if (fallback) {
      pathId = "[FALLBACK]"
    } else if (path) {
      pathId = path
    } else {
      pathId = "[PATH-EMPTY]"
    }

    return pathId
  }

  loadMatches() {
    const {newRouteParts, t} = this.tt
    const {component, path} = this.props
    const {exact, includeInPath, fallback} = this.p

    let matches = true
    const params = {}
    const componentPathParts = [...this.currentPath]

    this.log(() => [this.props.path, "Start generating component paths", JSON.stringify(componentPathParts)])

    for (const pathPartIndex in this.pathParts) {
      const pathPart = this.pathParts[pathPartIndex]
      const translatedPathPart = t(`routes.${pathPart}`, {defaultValue: pathPart})

      if (!(pathPartIndex in this.routeParts)) {
        this.log(() => `No match for: ${pathPartIndex}`)
        matches = false
        break
      }

      const routePart = decodeURIComponent(this.routeParts[pathPartIndex])

      if (pathPart.startsWith(":") && routePart) {
        const paramName = pathPart.slice(1, pathPart.length)

        params[paramName] = routePart
      } else if (translatedPathPart != routePart) {
        matches = false
        break
      } else if (!component && includeInPath) {
        componentPathParts.push(pathPart)
      }
    }

    if (exact && newRouteParts.length > 0) {
      this.log(() => ["Exact and more route parts", {newRouteParts, pathParts: this.pathParts, routeParts: this.routeParts}])
      matches = false
    } else if (matches && path) {
      matches = true
    } else if (this.routeParts.length == 0) {
      matches = true
    }

    const matchId = this.pathId()

    if (!matches && fallback) {
      matches = true
    }

    this.log(() => [this.props.path, "End generating component paths", JSON.stringify(componentPathParts), {matches}])

    if (matches) {
      if (component && includeInPath) {
        componentPathParts.push(component)
      }

      const newParams = Object.assign({}, this.currentParams, params) // eslint-disable-line prefer-object-spread

      this.updateRouteMatchState({componentPathParts, match: {params}, matches, newParams})
      this.switchGroup?.setPathMatched(matchId, true)
    } else {
      this.updateRouteMatchState({componentPathParts: null, match: null, matches, newParams: null})
      this.switchGroup?.setPathMatched(matchId, false)
    }
  }

  updateRouteMatchState({componentPathParts, match, matches, newParams}) {
    const routeDataChanged = this.routeDataChanged({componentPathParts, match, newParams})

    this.componentPathParts = componentPathParts
    this.match = match
    this.newParams = newParams
    if (routeDataChanged || this.s.matches != matches) {
      this.s.lastMatchUpdate = routeDataChanged ? this.lastMatchUpdate += 1 : this.s.lastMatchUpdate
      this.s.matches = matches
    }
  }

  routeDataChanged({componentPathParts, match, newParams}) {
    const currentComponentPathParts = this.componentPathParts || null
    const currentMatchParams = this.match?.params || null
    const nextMatchParams = match?.params || null
    const componentPathPartsChanged = this.nullableArrayDifferent(currentComponentPathParts, componentPathParts)
    const matchChanged = this.nullableObjectDifferent(currentMatchParams, nextMatchParams)
    const newParamsChanged = this.nullableObjectDifferent(this.newParams, newParams)

    return componentPathPartsChanged || matchChanged || newParamsChanged
  }

  nullableArrayDifferent(value, nextValue) {
    if (value === null || nextValue === null) {
      return value != nextValue
    }

    return arrayDifferent(value, nextValue)
  }

  nullableObjectDifferent(value, nextValue) {
    if (value === null || nextValue === null) {
      return value != nextValue
    }

    return simpleObjectDifferent(value, nextValue, true)
  }

  async loadComponent() {
    // Ignore late async route-component loads after a route switch or discarded mount.
    const requestId = this.loadComponentRequestId + 1

    this.loadComponentRequestId = requestId
    const actualComponentPath = this.props.componentPath || this.tt.componentPathParts.join("/")

    /** @type {RouteComponent | null} */
    let Component

    this.log(() => ["loadComponent", {componentPath: this.props.componentPath, componentPathParts: this.componentPathParts, actualComponentPath}])
    if (!this.tt.requireComponent) throw new Error("No 'requireComponent' available in route context")

    try {
      const componentImport = await this.tt.requireComponent({routeDefinition: {component: actualComponentPath}})

      Component = componentImport
    } catch (error) {
      console.error(`Couldn't find component: ${actualComponentPath}`)

      throw error
    }

    if (requestId != this.loadComponentRequestId) return

    this.s.Component = Component
    this.s.componentNotFound = !Component
  }

  log(callbackArgs) {
    if (this.debug) {
      let args = callbackArgs()

      if (!Array.isArray(args)) args = [args]

      console.log(...args)
    }
  }

  render() {
    const {componentPathParts, match, newParams, newRouteParts} = this.tt
    const {children, component, path} = this.props
    const {Component, componentNotFound, matches} = this.s

    if (!matches || !this.hasSwitchMatch()) {
      // Route isn't matching and shouldn't be rendered at all.
      return null
    }

    if (!Component && !children && !componentNotFound) {
      // Route is matching but hasn't been loaded yet.
      return (
        <div>
          {"Loading "}
          {component || this.props.componentPath || componentPathParts.join("/")}
        </div>
      )
    }

    if (!Component && !children && componentNotFound) {
      // Don't render anything if the component couldn't be found.
      return null
    }

    return (
      <CurrentPathContext.Provider value={componentPathParts}>
        <RouteContext.Provider value={newRouteParts.join("/")}>
          <ParamsContext.Provider value={newParams}>
            <Switch name={`route-group-${path}`} single={false}>
              {Component && <Component match={match} />}
              {children}
            </Switch>
          </ParamsContext.Provider>
        </RouteContext.Provider>
      </CurrentPathContext.Provider>
    )
  }
}))

export {RequireComponentContext, RouteContext, Switch, useParams}
export default Route
