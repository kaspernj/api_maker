import "./style"
import {digg, digs} from "diggerize"
import Link from "../../../link"
import MenuContent from "./menu-content"
import MenuItem from "./menu-item"
import React from "react"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import withCurrentUser from "../../../with-current-user"

class ComponentsAdminLayoutMenu extends React.PureComponent {
  static propTypes = PropTypesExact({
    active: PropTypes.string,
    currentUser: PropTypes.instanceOf(User),
    noAccess: PropTypes.bool.isRequired,
    onRequestMenuClose: PropTypes.func.isRequired,
    triggered: PropTypes.bool.isRequired
  })

  rootRef = React.createRef()

  render() {
    const {rootRef} = digs(this, "rootRef")
    const {active} = this.props
    const {
      currentUser,
      noAccess,
      triggered
    } = digs(
      this.props,
      "currentUser",
      "noAccess",
      "triggered"
    )
    return (
      <div className="components--admin--layout--menu" data-triggered={triggered} ref={rootRef}>
        <div className="menu-logo">
          <Link className="menu-logo-link" to={Params.withParams({})}>
            Admin
          </Link>
        </div>
        <div className="menu-items-center">
          {!noAccess &&
            <MenuContent active={active} />
          }
        </div>
        <div className="menu-items-bottom">
          {currentUser &&
            <div className="menu-user-section">
              <div className="menu-user-icon">
                <i className="fa fa-user" />
              </div>
              <div className="menu-user-name">
                <div className="menu-user-name-container">
                  {currentUser.name()}
                </div>
              </div>
            </div>
          }
          {currentUser &&
            <MenuItem
              active
              className="sign-out-menu-item"
              icon="sign-out-alt"
              label={I18n.t("js.components.admin.layout.menu.sign_out")}
              onClick={digg(this, "onSignOutClicked")}
            />
          }
        </div>
      </div>
    )
  }

  onSignOutClicked = async (e) => {
    e.preventDefault()

    try {
      await Devise.signOut()
      FlashMessage.success(I18n.t("js.components.admin.layout.menu.you_have_been_signed_out"))
    } catch (error) {
      FlashMessage.errorResponse(error)
    }
  }

}

export default withCurrentUser(ComponentsAdminLayoutMenu)
