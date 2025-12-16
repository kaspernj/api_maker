import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component"
import memo from "set-state-compare/src/memo"
import PropTypes from "prop-types"
import React from "react"
import SuperAdmin from "@kaspernj/api-maker/dist/super-admin"
import useCurrentUser from "@kaspernj/api-maker/dist/use-current-user"

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
