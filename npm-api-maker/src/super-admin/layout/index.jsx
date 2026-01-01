import React, {useMemo} from "react"
import {StyleSheet, View} from "react-native"
import BaseComponent from "../../base-component.js"
import CommandsPool from "../../commands-pool.js"
import config from "super-admin/config"
import Header from "./header.js"
import memo from "set-state-compare/build/memo.js"
import Menu from "./menu.js"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/build/shape-component.js"
import Text from "../../utils/text.js"
import useBreakpoint from "../../use-breakpoint.js"
import useCurrentUser from "../../use-current-user.js"
import useI18n from "i18n-on-steroids/src/use-i18n.mjs"

const NoAccess = React.lazy(() => import("./no-access.js"))

const styles = StyleSheet.create({
  appLayoutContentContainer: {
    base: {
      minHeight: "100vh",
      backgroundColor: "#f7f7f7"
    },
    mdDown: {
      paddingTop: 130,
      paddingRight: 30,
      paddingBottom: 30
    },
    mdUp: {
      paddingTop: 130,
      paddingRight: 30,
      paddingBottom: 30,
      paddingLeft: 280
    },
    lgUp: {
      paddingTop: 130,
      paddingRight: 30,
      paddingBottom: 30,
      paddingLeft: 320
    }
  },
  mb15: {
    marginBottom: 15
  },
  rootView: {
    width: "100%",
    minHeight: "100vh",
    backgroundColor: "#fff",
    color: "#000"
  }
})

export default memo(shapeComponent(class ApiMakerSuperAdminLayout extends BaseComponent {
  static propTypes = PropTypesExact({
    actions: PropTypes.any,
    active: PropTypes.string,
    children: PropTypes.any,
    className: PropTypes.string,
    currentCustomer: PropTypes.object,
    currentCustomerId: PropTypes.string,
    currentUser: PropTypes.object,
    headTitle: PropTypes.string,
    headerTitle: PropTypes.string
  })

  setup() {
    const currentUser = useCurrentUser()
    const {locale, t} = useI18n({namespace: "js.api_maker.super_admin.layout"})
    const {lgUp, mdUp, mdDown} = useBreakpoint()

    this.useStates({menuTriggered: false})
    this.setInstance({currentUser, lgUp, mdUp, mdDown, t})

    useMemo(() => {
      CommandsPool.current().globalRequestData.layout = "admin"
      CommandsPool.current().globalRequestData.locale = locale
    }, [locale])
  }

  render() {
    const {currentUser, lgUp, mdUp, mdDown, t} = this.tt
    const {
      actions,
      active,
      children,
      className,
      currentCustomer,
      currentCustomerId,
      headTitle,
      headerTitle,
      menu,
      ...restProps
    } = this.props
    const actualHeadTitle = headTitle || headerTitle

    if (actualHeadTitle) {
      document.title = actualHeadTitle
    } else {
      document.title = "Super Admin"
    }

    const noAccess = !currentUser
    const appLayoutContentContainerStyles = [styles.appLayoutContentContainer.base]

    if (mdDown) appLayoutContentContainerStyles.push(styles.appLayoutContentContainer.mdDown)
    if (mdUp) appLayoutContentContainerStyles.push(styles.appLayoutContentContainer.mdUp)
    if (lgUp) appLayoutContentContainerStyles.push(styles.appLayoutContentContainer.lgUp)

    return (
      <View
        dataSet={{component: "super-admin--layout", class: className, menuTriggered: this.s.menuTriggered}}
        style={styles.rootView}
        {...restProps}>
        <Menu
          active={active}
          noAccess={noAccess}
          onRequestMenuClose={this.tt.onRequestMenuClose}
          triggered={this.s.menuTriggered}
        />
        <Header actions={actions} onTriggerMenu={this.tt.onTriggerMenu} title={headerTitle} />
        <View dataSet={{class: "app-layout-content-container"}} style={appLayoutContentContainerStyles}>
          {noAccess &&
            <>
              <NoAccess />
              {currentUser &&
                <>
                  <Text style={styles.mb15}>
                    {t(".try_signing_out_and_in_with_a_different_user", {defaultValue: "Try signing in with a different user."})}
                  </Text>
                </>
              }
              {!currentUser &&
                <>
                  <Text style={styles.mb15}>
                    {t(".try_signing_in", {defaultValue: "Try signing in."})}
                  </Text>
                  {config.signInContent()}
                </>
              }
            </>
          }
          {!noAccess && children}
        </View>
      </View>
    )
  }

  onRequestMenuClose = () => this.setState({menuTriggered: false})
  onTriggerMenu = (e) => {
    e.preventDefault()
    this.setState({menuTriggered: !this.s.menuTriggered})
  }
}))
