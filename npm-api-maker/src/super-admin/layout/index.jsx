import "./style"
import classNames from "classnames"
import CommandsPool from "../../commands-pool"
import config from "super-admin/config"
import Header from "./header"
import Menu from "./menu"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import {memo, useCallback, useEffect} from "react"
import useCurrentUser from "../../use-current-user"
import useShape from "set-state-compare/src/use-s.js"

const NoAccess = React.lazy(() => import("./no-access"))

const ApiMakerSuperAdminLayout = ({
  actions,
  active,
  children,
  className,
  currentCustomer,
  currentCustomerId,
  headerTitle,
  menu,
  ...restProps
}) => {
  const s = useShape()
  const currentUser = useCurrentUser()

  useEffect(() => {
    CommandsPool.current().globalRequestData.layout = "admin"
    CommandsPool.current().globalRequestData.locale = I18n.locale
  }, [I18n.locale])

  const headTitle = headTitle || headerTitle

  if (headTitle) {
    document.title = headTitle
  } else {
    document.title = "Wooftech"
  }

  const setMenuTriggered = s.useState("menuTriggered", false)
  const noAccess = !currentUser
  const onRequestMenuClose = useCallback(() => setMenuTriggered(false), [])
  const onTriggerMenu = useCallback((e) => {
    e.preventDefault()
    setMenuTriggered(!s.state.menuTriggered)
  }, [])

  return (
    <div className={classNames("components--admin--layout", className)} data-menu-triggered={s.state.menuTriggered} {...restProps}>
      <Menu
        active={active}
        noAccess={noAccess}
        onRequestMenuClose={onRequestMenuClose}
        triggered={s.state.menuTriggered}
      />
      <Header actions={actions} onTriggerMenu={onTriggerMenu} title={headerTitle} />
      <div className="app-layout-content-container">
        {noAccess &&
          <>
            <NoAccess />
            {currentUser &&
              <>
                <div className="mb-4">
                  {I18n.t("js.api_maker.super_admin.layout.try_signing_out_and_in_with_a_different_user", {defaultValue: "Try signing in with a different user."})}
                </div>
              </>
            }
            {!currentUser &&
              <>
                <div className="mb-4">
                  {I18n.t("js.api_maker.super_admin.layout.try_signing_in", {defaultValue: "Try signing in."})}
                </div>
                {config.signInContent()}
              </>
            }
          </>
        }
        {!noAccess && children}
      </div>
    </div>
  )
}

ApiMakerSuperAdminLayout.propTypes = PropTypesExact({
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

export default memo(ApiMakerSuperAdminLayout)
