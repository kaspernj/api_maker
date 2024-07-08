import BaseComponent from "../../base-component"
import {memo} from "react"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import useCurrentUser from "../../use-current-user"

export default memo(shapeComponent(class ComponentsAdminLayoutNoAccess extends BaseComponent {
  render() {
    const currentUser = useCurrentUser()

    return (
      <div
        className="components--admin--layout-no-access"
        data-user-roles={currentUser?.userRoles()?.loaded()?.map((userRole) => userRole.role()?.identifier()).join(", ")}
      >
        {I18n.t("js.api_maker.super_admin.layout.no_access.you_dont_have_no_access_to_this_page", {defaultValue: "You don't have access to this page."})}
      </div>
    )
  }
}))
