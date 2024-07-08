import "./style"
import BaseComponent from "../../../base-component"
import {memo, useRef} from "react"
import Link from "../../../link"
import MenuContent from "./menu-content"
import MenuItem from "./menu-item"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import useCurrentUser from "../../../use-current-user"

export default memo(shapeComponent(class ComponentsAdminLayoutMenu extends ShapeComponent {
  static propTypes = PropTypesExact({
    active: PropTypes.string,
    noAccess: PropTypes.bool.isRequired,
    onRequestMenuClose: PropTypes.func.isRequired,
    triggered: PropTypes.bool.isRequired
  })

  render() {
    const {active, noAccess, triggered} = this.props
    const currentUser = useCurrentUser()
    const rootRef = useRef()

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
              label={I18n.t("js.api_maker.super_admin.layout.menu.sign_out", {defaultValue: "Sign out"})}
              onClick={this.tt.onSignOutClicked}
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
      FlashMessage.success(I18n.t("js.api_maker.super_admin.layout.menu.you_have_been_signed_out", {defaultValue: "You have been signed out"}))
    } catch (error) {
      FlashMessage.errorResponse(error)
    }
  }
}))
