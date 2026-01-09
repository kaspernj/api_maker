/* eslint-disable new-cap, no-extra-parens, no-return-assign, react/jsx-max-depth, react/jsx-no-literals, sort-imports */
import {View} from "react-native"
import BaseComponent from "../../../base-component"
import Devise from "../../../devise.js"
import {FlashNotifications} from "flash-notifications"
import Icon from "../../../utils/icon"
import memo from "set-state-compare/build/memo.js"
import Link from "../../../link"
import MenuContent from "./menu-content"
import MenuItem from "./menu-item"
import Params from "../../../params.js"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React from "react"
import {shapeComponent} from "set-state-compare/build/shape-component.js"
import Text from "../../../utils/text"
import useBreakpoint from "../../../use-breakpoint.js"
import useCurrentUser from "../../../use-current-user.js"
import useI18n from "i18n-on-steroids/src/use-i18n.mjs"
import {WithDefaultStyle} from "../../../utils/default-style"

const dataSets = {}
const styles = {}

export default memo(shapeComponent(class ComponentsAdminLayoutMenu extends BaseComponent {
  static propTypes = PropTypesExact({
    active: PropTypes.string,
    noAccess: PropTypes.bool.isRequired,
    onRequestMenuClose: PropTypes.func.isRequired,
    triggered: PropTypes.bool.isRequired
  })

  setup() {
    const {lgUp, mdDown, mdUp} = useBreakpoint()
    const {t} = useI18n({namespace: "js.api_maker.super_admin.layout.menu"})
    const currentUser = useCurrentUser()

    this.setInstance({currentUser, lgUp, mdDown, mdUp, t})
  }

  render() { // eslint-disable-line complexity
    const {currentUser, lgUp, mdDown, mdUp, t} = this.tt
    const {active, noAccess, triggered} = this.props

    if (mdDown && !triggered) {
      return null
    }

    return (
      <View
        dataSet={dataSets[`rootView-${triggered}`] ||= {component: "super-admin--layout--menu", triggered}}
        style={styles[`root-${mdDown}-${mdUp}-${lgUp}`] ||= {
          position: "fixed",
          zIndex: 9,
          overflowY: "auto",
          overflowX: "hidden",
          top: 0,
          left: 0,
          height: "100%",
          flexDirection: "column",
          backgroundColor: "#1b1c1e",
          width: (lgUp && 290) || (mdUp && 250) || (mdDown && "100%") || undefined,
          maxWidth: mdDown ? 250 : undefined,
          maxHeight: mdDown ? "100vh" : undefined
        }}
      >
        <WithDefaultStyle style={styles.withDefaultStyle ||= {Text: {color: "#fff"}}}>
          <View
            dataSet={dataSets.menuLogoView ||= {class: "menu-logo"}}
            style={styles.menuLogoView ||= {
              overflow: "hidden",
              marginTop: 25,
              marginRight: "auto",
              marginLeft: "auto"
            }}
          >
            <Link dataSet={dataSets.menuLogoLink ||= {class: "menu-logo-link"}} to={Params.withParams({})}>
              <Text
                style={styles.menuLogoLinkText ||= {
                  color: "#dededf",
                  textDecorationLine: "none",
                  fontSize: 42,
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                Admin
              </Text>
            </Link>
          </View>
          <View
            dataSet={dataSets.menuItemsCenter ||= {class: "menu-items-center"}}
            style={styles.menuItemsCenter ||= {marginTop: 25}}
          >
            {!noAccess &&
              <MenuContent active={active} />
            }
          </View>
          <View
            dataSet={dataSets.menuItemsBottom ||= {class: "menu-items-bottom"}}
            style={styles.menuItemsBottom ||= {marginTop: "auto", marginBottom: 25}}
          >
            {currentUser &&
              <View
                dataSet={dataSets.menuUserSection ||= {class: "menu-user-section"}}
                style={styles.menuUserSection ||= {
                  flexDirection: "row",
                  alignItems: "center",
                  marginRight: 25,
                  marginBottom: 25,
                  marginLeft: 25
                }}
              >
                <View
                  dataSet={dataSets.menuUserIcon ||= {class: "menu-user-icon"}}
                  style={styles.menuUserIcon ||= {
                    width: 44,
                    height: 44,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#abbcd0",
                    borderRadius: "50%"
                  }}
                >
                  <Icon name="user" size={12} />
                </View>
                <View className="menu-user-name" style={styles.userName ||= {flexShrink: 1, marginLeft: 8}}>
                  <Text
                    dataSet={dataSets.menuUserNameContainer ||= {class: "menu-user-name-container"}}
                    style={styles.userNameContainer ||= {overflow: "hidden", maxWidth: 140}}
                  >
                    {currentUser.name()}
                  </Text>
                </View>
              </View>
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
          </View>
        </WithDefaultStyle>
      </View>
    )
  }

  onSignOutClicked = async (e) => {
    e.preventDefault()

    try {
      await Devise.signOut()
      FlashNotifications.success(this.t(".you_have_been_signed_out", {defaultValue: "You have been signed out"}))
    } catch (error) {
      FlashNotifications.errorResponse(error)
    }
  }
}))
