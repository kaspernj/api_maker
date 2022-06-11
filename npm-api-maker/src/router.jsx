import PropTypes from "prop-types"
import React from "react"
import shouldComponentUpdate from "set-state-compare/src/should-component-update"
import {Suspense} from "react"
import withRouter from "./with-router"

class ApiMakerRouter extends React.Component {
  static propTypes = {
    notFoundComponent: PropTypes.elementType,
    requireComponent: PropTypes.func.isRequired
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shouldComponentUpdate(this, nextProps, nextState)
  }

  render() {
    const {match, ...restProps} = this.props
    const {matchingRoute} = match

    if (!matchingRoute) {
      if (this.props.notFoundComponent) {
        const NotFoundComponent = this.props.notFoundComponent

        return (
          <Suspense fallback={<div />}>
            <NotFoundComponent />
          </Suspense>
        )
      } else {
        return null
      }
    }

    const Component = this.props.requireComponent({routeDefinition: matchingRoute.parsedRouteDefinition.routeDefinition})

    return (
      <Suspense fallback={<div />}>
        <Component match={match} {...restProps} />
      </Suspense>
    )
  }
}

export default withRouter(ApiMakerRouter)
