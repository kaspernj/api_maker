import Link from "@kaspernj/api-maker/build/link"
import Text from "@kaspernj/api-maker/build/utils/text"
import Layout from "components/layout"
import memo from "set-state-compare/build/memo.js"
import React from "react"
import Routes from "shared/routes"
import {View} from "react-native"

const styles = {}

function RoutesUtilsLinkPadding() {
  return (
    <Layout>
      <View testID="utils-link-padding">
        <Link
          paddingHorizontal={12}
          paddingVertical={8}
          style={styles.link ||= {backgroundColor: "#f5f5f5"}}
          testID="utils-link-padding-link"
          to={Routes.utilsLinkPaddingPath()}
        >
          <Text>
            {"Utils link padding"}
          </Text>
        </Link>
      </View>
    </Layout>
  )
}

export default memo(RoutesUtilsLinkPadding)
