import {Text, View} from "react-native"
import Layout from "components/layout"
import React from "react"
import {QueryParamsContext} from "on-location-changed/build/location-context"
import {Task} from "models.js"
import useModel from "@kaspernj/api-maker/src/use-model.js"

function UseModelNewIfNoIdUndefinedQueryParamsContent() {
  const {task} = useModel(Task, {
    match: {params: {}},
    newIfNoId: {
      defaults: () => ({name: "Default task name"})
    }
  })

  return (
    <Layout>
      <View>
        <Text dataSet={{testid: "utils-use-model-new-if-no-id-undefined-query-params"}}>
          {task.readAttribute("name")}
        </Text>
      </View>
    </Layout>
  )
}

export default function RoutesUtilsUseModelNewIfNoIdUndefinedQueryParams() {
  return (
    <QueryParamsContext.Provider value={undefined}>
      <UseModelNewIfNoIdUndefinedQueryParamsContent />
    </QueryParamsContext.Provider>
  )
}
