import "./style"
import classNames from "classnames"
import CommandsPool from "@kaspernj/api-maker/src/commands-pool"
import Header from "./header"
import Menu from "./menu"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import withCurrentUser from "../../with-current-user"

const NoAccess = React.lazy(() => import("./no-access"))

class ApiMakerSuperAdminLayout extends React.PureComponent {
  static defaultProps = {
    requireAdmin: true
  }

  static propTypes = PropTypesExact({
    actions: PropTypes.node,
    active: PropTypes.string,
    children: PropTypes.node,
    className: PropTypes.string,
    currentCustomer: PropTypes.instanceOf(User),
    currentCustomerId: PropTypes.string,
    currentUser: PropTypes.instanceOf(User),
    headTitle: PropTypes.string,
    headerTitle: PropTypes.string,
    requireAdmin: PropTypes.bool.isRequired
  })

  componentDidMount() {
    CommandsPool.current().globalRequestData.layout = "admin"
    CommandsPool.current().globalRequestData.locale = I18n.locale

    this.setDocumentTitle()
  }

  componentDidUpdate() {
    this.setDocumentTitle()
  }

  setDocumentTitle() {
    const headTitle = this.props.headTitle || this.props.headerTitle

    if (headTitle) {
      document.title = headTitle
    } else {
      document.title = "Wooftech"
    }
  }

  shape = new Shape(this, {
    menuTriggered: false
  })

  render() {
    const {
      actions,
      active,
      children,
      className,
      currentCustomer,
      currentCustomerId,
      currentUser,
      headerTitle,
      menu,
      requireAdmin,
      ...restProps
    } = this.props
    const {menuTriggered} = digs(this.shape, "menuTriggered")
    const noAccess = this.noAccess()

    return (
      <div className={classNames("components--admin--layout", className)} data-menu-triggered={menuTriggered} {...restProps}>
        <Menu
          active={active}
          noAccess={noAccess}
          onRequestMenuClose={digg(this, "onRequestMenuClose")}
          triggered={menuTriggered}
        />
        <Header actions={actions} onTriggerMenu={digg(this, "onTriggerMenu")} title={headerTitle} />
        <div className="app-layout-content-container">
          {noAccess &&
            <>
              <NoAccess />
              {currentUser &&
                <>
                  <div className="mb-4">
                    {I18n.t("js.components.app_layout.try_signing_out_and_in_with_a_different_user")}
                  </div>
                  {(isCurrentUserA("teacher") || isCurrentUserA("student")) &&
                    <div className="mb-4">
                      {this.clickHereToAccessTheUserUniverse()}
                    </div>
                  }
                </>
              }
              {!currentUser &&
                <>
                  <div className="mb-4">
                    {I18n.t("js.components.app_layout.try_signing_in")}
                  </div>
                </>
              }
            </>
          }
          {!noAccess && children}
        </div>
      </div>
    )
  }

  clickHereToAccessTheUserUniverse() {
    const replaces = [
      {
        component: (
          <Link key="here-user-universe-link" to={Routes.userRootPath()}>
            {I18n.t("js.components.app_layout.here")}
          </Link>
        ),
        text: "%{here}"
      },
      {
        component: (
          <Link key="user-universe-link" to={Routes.userRootPath()}>
            {I18n.t("js.components.app_layout.user_universe")}
          </Link>
        ),
        text: "%{user_universe}"
      }
    ]

    return (
      <TextComponentReplace
        replaces={replaces}
        text={I18n.t("js.components.app_layout.click_here_to_access_the_user_universe")}
      />
    )
  }

  onRequestMenuClose = () => this.shape.set({menuTriggered: false})

  onTriggerMenu = (e) => {
    e.preventDefault()

    this.shape.set({menuTriggered: !this.shape.menuTriggered})
  }

  noAccess() {
    const {currentUser, requireAdmin} = digs(this.props, "currentUser", "requireAdmin")

    if (requireAdmin && currentUser && !isCurrentUserA("admin") && !isCurrentUserA("hacker")) return true
    if (requireAdmin && !currentUser) return true

    return false
  }
}

export default withCurrentUser(ApiMakerSuperAdminLayout)
