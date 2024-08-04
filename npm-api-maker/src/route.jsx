import BaseComponent from "./base-component"
import {createContext, useContext, useMemo} from "react"
import memo from "set-state-compare/src/memo"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/src/shape-component.js"

const CurrentPathContext = createContext([])
const CurrentRouteGroupContext = createContext([])
const ParamsContext = createContext({})
const RequireComponentContext = createContext(null)
const RouteContext = createContext(null)
const useParams = () => useContext(ParamsContext)

const RouteGroup = memo(shapeComponent(class RouteGroup extends BaseComponent {
  static defaultProps = {
    name: "[no name]",
    single: true
  }

  static propTypes = propTypesExact({
    children: PropTypes.node,
    name: PropTypes.string,
    single: PropTypes.bool
  })

  pathsMatchedKeys = []

  setup() {
    this.useStates({
      lastUpdate: new Date(),
      pathShown: undefined,
      pathsMatched: {}
    })
  }

  render() {
    const {pathShown, pathsMatched} = this.s

    return (
      <CurrentRouteGroupContext.Provider value={{pathShown, pathsMatched, routeGroup: this}}>
        {this.props.children}
      </CurrentRouteGroupContext.Provider>
    )
  }

  pathShown(pathsMatched) {
    for (const pathMatched of this.tt.pathsMatchedKeys) {
      const isPathMatched = pathsMatched[pathMatched]

      if (isPathMatched) {
        return pathMatched
      }
    }
  }

  setPathMatched(path, matched) {
    const {pathsMatchedKeys} = this.tt
    const {pathsMatched} = this.s

    if (!path) throw new Error("No 'path' given")
    if (pathsMatched[path] == matched) return

    if (!pathsMatchedKeys.includes(path)) {
      pathsMatchedKeys.push(path)
    }

    const newPathsMatched = {...this.s.pathsMatched}

    newPathsMatched[path] = matched

    const pathShown = this.pathShown(newPathsMatched)

    this.setState({
      lastUpdate: Math.random() + new Date().getTime(),
      pathShown,
      pathsMatched: newPathsMatched
    })
  }
}))

const Route = memo(shapeComponent(class Route extends BaseComponent {
  static defaultProps = {
    exact: false,
    fallback: false,
    includeInPath: true
  }

  static propTypes = propTypesExact({
    component: PropTypes.string,
    componentPath: PropTypes.string,
    exact: PropTypes.bool.isRequired,
    fallback: PropTypes.bool.isRequired,
    includeInPath: PropTypes.bool.isRequired,
    onMatch: PropTypes.func,
    path: PropTypes.string
  })

  match = null
  newParams = null
  pathParts = null

  setup() {
    const {path} = this.props
    const {pathsMatched, routeGroup} = useContext(CurrentRouteGroupContext)
    const givenRoute = useContext(RouteContext)
    const {pathShown} = routeGroup.s

    this.requireComponent = useContext(RequireComponentContext)
    this.currentParams = useContext(ParamsContext)
    this.currentPath = useContext(CurrentPathContext)
    this.routeGroup = routeGroup

    this.routeParts = useMemo(() => {
      let routeParts = givenRoute?.split("/")

      return routeParts
    }, [path, givenRoute])

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

    this.useStates({Component: null, componentNotFound: null, matches: false})

    useMemo(() => {
      this.loadMatches()
    }, [givenRoute, path, pathsMatched])

    useMemo(() => {
      const pathId = this.pathId()
      let matched = false

      if (pathShown && pathShown == pathId) {
        matched = true
      }

      if (matched && !this.s.Component && this.s.matches) {
        if (this.props.onMatch) {
          this.props.onMatch()
        }

        this.loadComponent()
      }
    }, [path, pathShown, this.s.matches])
  }

  pathId() {
    const {fallback} = this.p
    const {path} = this.props
    let pathId

    if (fallback) {
      pathId = "[FALLBACK]"
    } else if (!path) {
      pathId = "[PATH-EMPTY]"
    } else {
      pathId = path
    }

    return pathId
  }

  loadMatches() {
    const {newRouteParts} = this.tt
    const {component, path} = this.props
    const {exact, includeInPath, fallback} = this.p

    let matches = true
    const params = {}
    const componentPathParts = [...this.currentPath]

    for (const pathPartIndex in this.pathParts) {
      const pathPart = this.pathParts[pathPartIndex]
      const translatedPathPart = I18n.t(`routes.${pathPart}`, {defaultValue: pathPart})

      if (!(pathPartIndex in this.routeParts)) {
        matches = false
        break
      }

      const routePart = this.routeParts[pathPartIndex]

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

    if (matches) {
      if (component && includeInPath) {
        componentPathParts.push(component)
      }

      const newParams = Object.assign(this.currentParams, params)

      this.setInstance({componentPathParts, match: {params}, newParams})
      this.setState({matches})
      this.routeGroup?.setPathMatched(matchId, true)
    } else {
      this.setInstance({componentPathParts: null, match: null, newParams: null})
      this.setState({matches})
      this.routeGroup?.setPathMatched(matchId, false)
    }
  }

  async loadComponent() {
    const actualComponentPath = this.props.componentPath || this.tt.componentPathParts.join("/")
    let Component

    try {
      const componentImport = await this.tt.requireComponent({routeDefinition: {component: actualComponentPath}})

      Component = componentImport.default
    } catch (error) {
      console.error(`Couldn't find component: ${actualComponentPath}`)
    }

    this.setState({Component, componentNotFound: !Component})
  }

  render() {
    const {componentPathParts, match, newParams, newRouteParts} = this.tt
    const {component, path} = this.props
    const {Component, componentNotFound, matches} = this.s

    if (!matches) {
      // Route isn't matching and shouldn't be rendered at all.
      return null
    }

    if (!Component && !componentNotFound) {
      // Route is matching but hasn't been loaded yet.
      return (
        <div>Loading {component || componentPathParts.join("/")}</div>
      )
    }

    if (!Component && componentNotFound) {
      // Don't render anything if the component couldn't be found.
      return null
    }

    return (
      <CurrentPathContext.Provider value={componentPathParts}>
        <RouteContext.Provider value={newRouteParts.join("/")}>
          <ParamsContext.Provider value={newParams}>
            <RouteGroup name={`route-group-${path}`} single={false}>
              <Component match={match} />
            </RouteGroup>
          </ParamsContext.Provider>
        </RouteContext.Provider>
      </CurrentPathContext.Provider>
    )
  }
}))

export {RequireComponentContext, RouteContext, RouteGroup, useParams}
export default Route
