import {StyleSheet, View} from "react-native"
import BaseComponent from "../../../base-component"
import Devise from "../../../devise"
import {FlashNotifications} from "flash-notifications"
import Icon from "../../../utils/icon"
import memo from "set-state-compare/src/memo"
import Link from "../../../link"
import MenuContent from "./menu-content"
import MenuItem from "./menu-item"
import Params from "../../../params"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React from "react"
import {shapeComponent} from "set-state-compare/src/shape-component"
import Text from "../../../utils/text"
import useBreakpoint from "../../../use-breakpoint"
import useCurrentUser from "../../../use-current-user"
import useI18n from "i18n-on-steroids/src/use-i18n"
import {WithDefaultStyle} from "../../../utils/default-style"

const styles = StyleSheet.create({
  root: {
    base: {
      position: "fixed",
      zIndex: 9,
      overflowY: "auto",
      overflowX: "hidden",
      top: 0,
      left: 0,
      height: "100%",
      flexDirection: "column",
      backgroundColor: "#1b1c1e"
    },
    mdDown: {
      width: "100%",
      maxWidth: 250,
      maxHeight: "100vh",
      overflowY: "auto"
    },
    mdUp: {
      width: 250
    },
    lgUp: {
      width: 290
    }
  },
  userName: {
    flexShrink: 1,
    marginLeft: 8
  },
  userNameContainer: {
    overflow: "hidden",
    maxWidth: 140
  }
})

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

  render() {
    const {currentUser, lgUp, mdDown, mdUp, t} = this.tt
    const {active, noAccess, triggered} = this.props

    const style = [styles.root.base]

    if (mdDown) style.push(styles.root.mdDown)
    if (mdUp) style.push(styles.root.mdUp)
    if (lgUp) style.push(styles.root.lgUp)

    if (mdDown && !triggered) {
      return null
    }

    return (
      <View dataSet={this.rootViewDataSet ||= {component: "super-admin--layout--menu", triggered}} style={style}>
        <WithDefaultStyle style={this.withDefaultStyleStyle ||= {Text: {color: "#fff"}}}>
          <View
            dataSet={this.menuLogoViewDataSet ||= {class: "menu-logo"}}
            style={this.menuLogoViewStyle ||= {
              overflow: "hidden",
              marginTop: 25,
              marginRight: "auto",
              marginLeft: "auto"
            }}
          >
            <Link dataSet={this.menuLogoLinkDataSet ||= {class: "menu-logo-link"}} to={Params.withParams({})}>
              <Text
                style={this.menuLogoLinkTextStyle ||= {
                  fontSize: 42,
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                Admin
              </Text>
            </Link>
          </View>
          <View dataSet={{class: "menu-items-center"}} style={{marginTop: 25}}>
            {!noAccess &&
              <MenuContent active={active} />
            }
          </View>
          <View dataSet={{class: "menu-items-bottom"}} style={{marginTop: "auto", marginBottom: 25}}>
            {currentUser &&
              <View
                dataSet={{class: "menu-user-section"}}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginRight: 25,
                  marginBottom: 25,
                  marginLeft: 25
                }}
              >
                <View
                  dataSet={{class: "menu-user-icon"}}
                  style={{
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
                <View className="menu-user-name" style={styles.userName}>
                  <Text dataSet={{class: "menu-user-name-container"}} style={styles.userNameContainer}>
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
