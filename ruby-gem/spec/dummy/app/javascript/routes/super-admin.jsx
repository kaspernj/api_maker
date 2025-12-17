import {shapeComponent, ShapeComponent} from ""set-state-compare/build/shape-component.js"
import memo from ""set-state-compare/build/memo.js"
import PropTypes from "prop-types"
import React from "react"
import SuperAdmin from "@kaspernj/api-maker/build/super-admin"
import useCurrentUser from "@kaspernj/api-maker/build/use-current-user.js"

export default memo(shapeComponent(class RoutesSuperAdmin extends ShapeComponent {
  static propTypes = {
    currentUser: PropTypes.object
  }

  render() {
    const currentUser = useCurrentUser()

    return (
      <SuperAdmin currentUser={currentUser} />
    )
  }
}))
