import BaseComponent from "../../base-component"
import memo from "set-state-compare/src/memo"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import useCurrentUser from "../../use-current-user"
import useI18n from "i18n-on-steroids/src/use-i18n.mjs"
import {View} from "react-native"

export default memo(shapeComponent(class ComponentsAdminLayoutNoAccess extends BaseComponent {
  render() {
    const currentUser = useCurrentUser()
    const {t} = useI18n({namespace: "js.api_maker.super_admin.layout.no_access"})

    return (
      <View
        dataSet={{
          component: "super-admin--layout--no-access",
          userRoles: currentUser?.userRoles()?.loaded()?.map((userRole) => userRole.role()?.identifier()).join(", ")
        }}
      >
        {t(".you_dont_have_no_access_to_this_page", {defaultValue: "You don't have access to this page."})}
      </View>
    )
  }
}))
