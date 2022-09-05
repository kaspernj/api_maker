import "./style"
import {PopupMenu, PopupMenuItem} from "components/popup-menu"
import MenuContent from "./menu-content"
import MenuItem from "./menu-item"

class ComponentsAdminLayoutMenu extends BaseComponent {
  static propTypes = PropTypesExact({
    active: PropTypes.string,
    currentUser: PropTypes.instanceOf(User),
    noAccess: PropTypes.bool.isRequired,
    onRequestMenuClose: PropTypes.func.isRequired,
    triggered: PropTypes.bool.isRequired
  })

  menuUserItemsRef = React.createRef()
  rootRef = React.createRef()
  shape = new Shape(this, {userMenuItemOpen: false})

  render() {
    const {menuUserItemsRef, onUserItemsClicked, rootRef} = digs(this, "menuUserItemsRef", "onUserItemsClicked", "rootRef")
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
    const {userMenuItemOpen} = digs(this.shape, "userMenuItemOpen")

    return (
      <div className="components--admin--layout--menu" data-triggered={triggered} ref={rootRef}>
        <EventListener event="mouseup" onCalled={digg(this, "onWindowMouseUp")} target={window} />
        <div className="menu-logo">
          <Link className="menu-logo-link" to={Routes.adminRootPath()}>
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
              <div className="menu-user-items" ref={menuUserItemsRef}>
                {userMenuItemOpen &&
                  <PopupMenu>
                    <PopupMenuItem
                      children={I18n.t("js.components.app_layout.menu.notification_settings")}
                      className="notifications-settings-menu-item"
                      to="#"
                    />
                  </PopupMenu>
                }
                <a className="menu-user-items-link" href="#" onClick={onUserItemsClicked}>
                  <i className="fa fa-ellipsis" />
                </a>
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

  onUserItemsClicked = (e) => {
    e.preventDefault()
    this.shape.set({userMenuItemOpen: !this.shape.userMenuItemOpen})
  }

  onWindowMouseUp = (e) => {
    const {menuUserItemsRef, rootRef} = digs(this, "menuUserItemsRef", "rootRef")
    const {triggered} = digs(this.props, "triggered")

    // Close the menu if triggered (menu is open on mobile)
    if (triggered && !rootRef.current.contains(e.target)) setTimeout(this.props.onRequestMenuClose)

    // Close the user items menu if clicked happened outside of that
    if (!menuUserItemsRef?.current?.contains(e.target)) this.shape.set({userMenuItemOpen: false})
  }
}

export default withCurrentUser(ComponentsAdminLayoutMenu)
