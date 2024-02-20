import {memo} from "react"
import useCurrentUser from "../../use-current-user"

const ComponentsAdminLayoutNoAccess = () => {
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

export default memo(ComponentsAdminLayoutNoAccess)
