import "./style"
import BaseComponent from "../../base-component"
import CommandsPool from "../../commands-pool"
import config from "super-admin/config"
import Header from "./header"
import memo from "set-state-compare/src/memo"
import Menu from "./menu"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import {useMemo} from "react"
import {shapeComponent} from "set-state-compare/src/shape-component"
import useCurrentUser from "../../use-current-user"
import useI18n from "i18n-on-steroids/src/use-i18n"
import {View} from "react-native"

const NoAccess = React.lazy(() => import("./no-access"))

export default memo(shapeComponent(class ApiMakerSuperAdminLayout extends BaseComponent {
  static propTypes = PropTypesExact({
    actions: PropTypes.node,
    active: PropTypes.string,
    children: PropTypes.node,
    className: PropTypes.string,
    currentCustomer: PropTypes.instanceOf(User),
    currentCustomerId: PropTypes.string,
    currentUser: PropTypes.instanceOf(User),
    headTitle: PropTypes.string,
    headerTitle: PropTypes.string
  })

  setup() {
    const currentUser = useCurrentUser()
    const {locale, t} = useI18n({namespace: "js.api_maker.super_admin.layout"})

    this.useStates({menuTriggered: false})
    this.setInstance({currentUser, t})

    useMemo(() => {
      CommandsPool.current().globalRequestData.layout = "admin"
      CommandsPool.current().globalRequestData.locale = locale
    }, [I18n.locale])
  }

  render() {
    const {currentUser, t} = this.tt
    const {
      actions,
      active,
      children,
      className,
      currentCustomer,
      currentCustomerId,
      headerTitle,
      menu,
      ...restProps
    } = this.props
    const headTitle = headTitle || headerTitle

    if (headTitle) {
      document.title = headTitle
    } else {
      document.title = "Wooftech"
    }

    const noAccess = !currentUser

    return (
      <View dataSet={{component: "super-admin--layout", class: className, menuTriggered: this.s.menuTriggered}} {...restProps}>
        <Menu
          active={active}
          noAccess={noAccess}
          onRequestMenuClose={this.tt.onRequestMenuClose}
          triggered={this.s.menuTriggered}
        />
        <Header actions={actions} onTriggerMenu={this.tt.onTriggerMenu} title={headerTitle} />
        <View dataSet={{class: "app-layout-content-container"}}>
          {noAccess &&
            <>
              <NoAccess />
              {currentUser &&
                <>
                  <div className="mb-4">
                    {t(".try_signing_out_and_in_with_a_different_user", {defaultValue: "Try signing in with a different user."})}
                  </div>
                </>
              }
              {!currentUser &&
                <>
                  <div className="mb-4">
                    {t(".try_signing_in", {defaultValue: "Try signing in."})}
                  </div>
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
    setMenuTriggered(!this.s.menuTriggered)
  }
}))
