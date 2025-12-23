import config from "./config.js"
import escapeStringRegexp from "escape-string-regexp"
import * as inflection from "inflection"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {useCallback, useMemo} from "react"
import useShape from "set-state-compare/build/use-shape.js"

const useRouterPropTypes = propTypesExact({
  locales: PropTypes.array.isRequired,
  path: PropTypes.string,
  routeDefinitions: PropTypes.object.isRequired,
  routes: PropTypes.object.isRequired
})

/**
 * @param {{locales: string[], path?: string, routeDefinitions?: {routes: Array<{name: string, path: string}>}, routes?: Record<string, Function>}} props
 * @returns {{match: {matchingRoute?: {params: Record<string, string>, parsedRouteDefinition: any}, params: Record<string, string>}}}
 */
const useRouter = (props) => {
  PropTypes.checkPropTypes(useRouterPropTypes, props, "prop", "useRouter")

  const s = useShape(props)
  const locales = s.p.locales

  if (!Array.isArray(locales)) {
    throw new Error("useRouter expected 'locales' to be an array")
  }

  const findRouteParams = useCallback((routeDefinition) => {
    const result = []
    const parts = routeDefinition.path.split("/")

    for (const part of parts) {
      if (part.match(/^:([a-z_]+)$/))
        result.push(part)
    }

    return result
  }, [])

  const getPath = useCallback(() => {
    let path = s.p.path || window.location.pathname

    path = path.replace(/[/]+$/, "")

    return path
  }, [])

  const getRouteDefinitions = useCallback(() => s.p.routeDefinitions || config.getRouteDefinitions(), [])
  const getRoutes = useCallback(() => s.p.routes || config.getRoutes(), [])

  const parseRouteDefinitions = useCallback(() => {
    const routeDefinitions = getRouteDefinitions()
    const routes = getRoutes()

    if (!Array.isArray(routeDefinitions.routes)) {
      throw new Error("useRouter expected 'routeDefinitions.routes' to be an array")
    }

    if (!routes || typeof routes != "object") {
      throw new Error("useRouter expected 'routes' to be an object with route helpers")
    }

    const regex = /:([A-z\d_]+)/
    const parsedRouteDefinitions = []

    for (const locale of s.p.locales) {
      for (const routeDefinition of routeDefinitions.routes) {
        if (!routeDefinition?.name || !routeDefinition?.path) {
          throw new Error("useRouter expected each routeDefinition to have 'name' and 'path'")
        }

        const routePathName = `${inflection.camelize(routeDefinition.name, true)}Path`
        const params = findRouteParams(routeDefinition)

        params.push({locale})

        if (!(routePathName in routes))
          throw new Error(`${routePathName} not found in routes: ${Object.keys(routes).join(", ")}`)

        const routePath = routes[routePathName](...params).replace(/[/]+$/, "")
        const groups = []
        let pathRegexString = "^"

        pathRegexString += escapeStringRegexp(routePath)

        while (true) {
          const match = pathRegexString.match(regex)

          if (!match) break

          const variableName = match[1]

          groups.push(variableName)

          pathRegexString = pathRegexString.replace(match[0], "([^/]+)")
        }

        pathRegexString += "$"

        const pathRegex = new RegExp(pathRegexString)

        parsedRouteDefinitions.push({groups, pathRegex, routeDefinition})
      }
    }

    return parsedRouteDefinitions
  }, [])

  const parsedRouteDefinitions = useMemo(() => parseRouteDefinitions(), [])

  s.updateMeta({parsedRouteDefinitions})

  const findMatchingRoute = useCallback(() => {
    const path = getPath()

    for (const parsedRouteDefinition of s.m.parsedRouteDefinitions) {
      const match = path.match(parsedRouteDefinition.pathRegex)
      let matched, params

      if (match) {
        matched = true
        params = {}

        for (const groupKey in parsedRouteDefinition.groups) {
          const groupName = parsedRouteDefinition.groups[groupKey]

          params[groupName] = match[Number(groupKey) + 1]
        }
      }

      if (path == "" && parsedRouteDefinition.routeDefinition.path == "/") matched = true
      if (matched) {
        return {params, parsedRouteDefinition}
      }
    }
  }, [])

  const matchingRoute = findMatchingRoute()
  const params = matchingRoute?.params || {}
  const match = {
    matchingRoute,
    params
  }

  return {match}
}

export default useRouter
