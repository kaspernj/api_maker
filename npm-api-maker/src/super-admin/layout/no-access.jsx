// @ts-check
/* eslint-disable newline-per-chained-call, no-return-assign, react/jsx-one-expression-per-line, sort-imports */
import memo from "set-state-compare/build/memo.js"
import React from "react"
import {View} from "react-native"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import Text from "../../utils/text"
import useCurrentUser from "../../use-current-user.js"
import useI18n from "i18n-on-steroids/build/src/use-i18n.js"

const dataSets = {}

/** @typedef {Record<string, never>} Props */
/** @typedef {Record<string, never>} State */
export default memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class ComponentsAdminLayoutNoAccess extends ShapeComponent {
  render() {
    const currentUser = useCurrentUser()
    const {t} = useI18n({namespace: "js.api_maker.super_admin.layout.no_access"})
    const userRoles = currentUser?.userRoles()?.loaded()?.map((userRole) => userRole.role()?.identifier()).join(", ")

    return (
      <View
        dataSet={dataSets[`noAccess-${userRoles}`] ||= {
          component: "super-admin--layout--no-access",
          userRoles
        }}
      >
        <Text>{t(".you_dont_have_no_access_to_this_page", {defaultValue: "You don't have access to this page."})}</Text>
      </View>
    )
  }
}))
