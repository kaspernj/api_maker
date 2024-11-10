import "./style"
import BaseComponent from "../../../base-component"
import {memo} from "react"
import Link from "../../../link"
import MenuContent from "./menu-content"
import MenuItem from "./menu-item"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import Text from "../../../utils/text"
import useCurrentUser from "../../../use-current-user"
import useI18n from "i18n-on-steroids/src/use-i18n.mjs"
import {View} from "react-native"

export default memo(shapeComponent(class ComponentsAdminLayoutMenu extends BaseComponent {
  static propTypes = PropTypesExact({
    active: PropTypes.string,
    noAccess: PropTypes.bool.isRequired,
    onRequestMenuClose: PropTypes.func.isRequired,
    triggered: PropTypes.bool.isRequired
  })

  setup() {
    const {t} = useI18n({namespace: "js.api_maker.super_admin.layout.menu"})
    const currentUser = useCurrentUser()

    this.setInstance({currentUser, t})
  }

  render() {
    const {currentUser, t} = this.tt
    const {active, noAccess, triggered} = this.props

    return (
      <View dataSet={{component: "super-admin--layout--menu", triggered}}>
        <div className="menu-logo">
          <Link dataSet={{class: "menu-logo-link"}} to={Params.withParams({})}>
            <Text>
              Admin
            </Text>
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
              label={t(".sign_out", {defaultValue: "Sign out"})}
              onClick={this.tt.onSignOutClicked}
            />
          }
        </div>
      </View>
    )
  }

  onSignOutClicked = async (e) => {
    e.preventDefault()

    try {
      await Devise.signOut()
      FlashMessage.success(this.t(".you_have_been_signed_out", {defaultValue: "You have been signed out"}))
    } catch (error) {
      FlashMessage.errorResponse(error)
    }
  }
}))
