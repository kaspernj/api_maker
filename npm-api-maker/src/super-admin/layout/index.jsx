import "./style"
import classNames from "classnames"
import CommandsPool from "../../commands-pool"
import {digg, digs} from "diggerize"
import Header from "./header"
import Link from "../../link"
import Menu from "./menu"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import withCurrentUser from "../../with-current-user"

const NoAccess = React.lazy(() => import("./no-access"))

class ApiMakerSuperAdminLayout extends React.PureComponent {
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

  state = {
    menuTriggered: false
  }

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
      ...restProps
    } = this.props
    const {menuTriggered} = digs(this.state, "menuTriggered")
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
                    {I18n.t("js.api_maker.super_admin.layout.try_signing_out_and_in_with_a_different_user")}
                  </div>
                </>
              }
              {!currentUser &&
                <>
                  <div className="mb-4">
                    {I18n.t("js.api_maker.super_admin.layout.try_signing_in")}
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

  onRequestMenuClose = () => this.setState({menuTriggered: false})

  onTriggerMenu = (e) => {
    e.preventDefault()

    this.setState({menuTriggered: !this.state.menuTriggered})
  }

  noAccess() {
    const {currentUser} = digs(this.props, "currentUser")

    if (!currentUser) return true

    return false
  }
}

export default withCurrentUser(ApiMakerSuperAdminLayout)
