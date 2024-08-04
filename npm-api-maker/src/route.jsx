import {createContext} from "react"
import memo from "set-state-compare/src/memo"
import RunLast from "./run-last.mjs"

const CurrentPathContext = createContext([])
const CurrentRouteGroupContext = createContext([])
const ParamsContext = createContext({})
const RequireComponentContext = createContext(null)
const RouteContext = createContext(null)

const useParams = () => {
  const params = useContext(ParamsContext)

  return params
}

const RouteGroup = memo(shapeComponent(class RouteGroup extends ShapeComponent {
  static defaultProps = {
    name: "[no name]",
    single: true
  }

  static propTypes = propTypesExact({
    children: PropTypes.node,
    name: PropTypes.string,
    single: PropTypes.bool
  })

  setup() {
    this.useStates({
      lastUpdate: new Date(),
      pathsMatched: {}
    })
  }

  render() {
    const {pathsMatched} = this.s

    return (
      <CurrentRouteGroupContext.Provider value={{pathsMatched, routeGroup: this}}>
        {this.props.children}
      </CurrentRouteGroupContext.Provider>
    )
  }

  anythingButPathMatched(path) {
    if (!path) {
      path = "[PATH-EMPTY]"
    }

    for (const pathMatched in this.s.pathsMatched) {
      if (path == pathMatched) {
        continue
      }

      const isPathMatched = this.s.pathsMatched[pathMatched]

      if (isPathMatched) {
        return pathMatched
      }
    }
  }

  setPathMatched(path, matched) {
    const {pathsMatched} = this.s

    if (!path) {
      path = "[PATH-EMPTY]"
    }

    if (pathsMatched[path] == matched) {
      return
    }

    const newPathsMatched = {...this.s.pathsMatched}

    newPathsMatched[path] = matched

    this.setState({pathsMatched: newPathsMatched})
    // this.setLastUpdateLast.queue()
  }

  setLastUpdate = () => {
    this.setState({lastUpdate: new Date()})
  }

  setLastUpdateLast = new RunLast(this.setLastUpdate)
}))

const RouteMatcher = memo(shapeComponent(class RouteMatcher extends ShapeComponent {
  match = null
  matches = false
  newParams = null
  pathParts = null

  setup() {
    const {path, route: givenRoute} = this.props
    const {pathsMatched, routeGroup} = useContext(CurrentRouteGroupContext)

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

    this.useStates({Component: null})
    useMemo(() => {
      this.loadMatches()
    }, [givenRoute, path, pathsMatched])
  }

  loadMatches() {
    const {newRouteParts} = this.tt
    const {component, exact, includeInPath = true, path} = this.props

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

    const alreadyMatchedPath = this.routeGroup?.anythingButPathMatched(path)

    if (matches && alreadyMatchedPath) {
      matches = false
    }

    if (matches) {
      if (component && includeInPath) {
        componentPathParts.push(component)
      }

      const newParams = Object.assign(this.currentParams, params)

      this.setInstance({componentPathParts, match: {params}, matches, newParams})
      this.loadComponent()
      this.routeGroup?.setPathMatched(path, true)
    } else {
      this.setInstance({componentPathParts: null, match: null, matches, newParams: null})
      this.routeGroup?.setPathMatched(path, false)
    }
  }

  async loadComponent() {
    const {componentPath, requireComponent} = this.p
    const {componentPathParts} = this.tt
    const actualComponentPath = componentPath || componentPathParts.join("/")
    const Component = await requireComponent({routeDefinition: {component: actualComponentPath}})

    this.setState({Component: Component.default})
  }

  render() {
    const {componentPathParts, match, matches, newParams, newRouteParts} = this.tt
    const {component, path} = this.props
    const {Component} = this.s

    if (!matches) {
      // Route isn't matching and shouldn't be rendered at all.
      return null
    }

    if (!Component) {
      // Route is matching but hasn't been loaded yet.
      return (
        <div>Loading {component || componentPathParts.join("/")}</div>
      )
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

export default memo(shapeComponent(class ApiMakerRoute extends ShapeComponent {
  render() {
    const {component, componentPath, exact, includeInPath = true, path} = this.props
    const requireComponent = useContext(RequireComponentContext)
    const route = useContext(RouteContext)
    const memoedRoute = useMemo(() => route, [route])

    return (
      <RouteMatcher
        component={component}
        componentPath={componentPath}
        exact={exact}
        includeInPath={includeInPath}
        path={path}
        requireComponent={requireComponent}
        route={memoedRoute}
      />
    )
  }
}))

export {RequireComponentContext, RouteContext, RouteGroup, useParams}
