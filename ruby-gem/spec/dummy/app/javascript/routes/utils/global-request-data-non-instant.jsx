import CommandsPool from "@kaspernj/api-maker/build/commands-pool"
import Layout from "components/layout"
import React, {useEffect, useState} from "react"
import Services from "@kaspernj/api-maker/build/services"
import {Text, View} from "react-native"

export default function RoutesUtilsGlobalRequestDataNonInstant() {
  const [result, setResult] = useState(null)

  useEffect(() => {
    const commandsPool = CommandsPool.current()

    commandsPool.globalRequestData.layout = "admin"
    commandsPool.globalRequestData.test_key = "expected"

    Services.current().sendRequest("GlobalRequestDataTest", {})
      .then((response) => setResult(response))
  }, [])

  return (
    <Layout className="routes-utils-global-request-data-non-instant">
      <View>
        <Text testID="global-request-data-layout">
          {result?.global?.layout || ""}
        </Text>
        <Text testID="global-request-data-test-key">
          {result?.global?.test_key || ""}
        </Text>
      </View>
    </Layout>
  )
}
