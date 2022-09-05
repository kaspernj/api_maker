import {digs} from "diggerize"
import PropTypes from "prop-types"
import React from "react"
import SuperAdmin from "@kaspernj/api-maker/src/super-admin"
import withCurrentUser from "@kaspernj/api-maker/src/with-current-user"

class RoutesSuperAdmin extends React.PureComponent {
  static propTypes = {
    currentUser: PropTypes.instanceOf(User)
  }

  render() {
    const {currentUser} = digs(this.props, "currentUser")

    return (
      <SuperAdmin currentUser={currentUser} />
    )
  }
}

export default withCurrentUser(RoutesSuperAdmin)
