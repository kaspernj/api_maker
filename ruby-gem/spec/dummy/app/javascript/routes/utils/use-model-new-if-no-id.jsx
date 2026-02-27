import {Text, View} from "react-native"
import Layout from "components/layout"
import React from "react"
import {Task} from "models.js"
import useModel from "@kaspernj/api-maker/src/use-model.js"

export default function RoutesUtilsUseModelNewIfNoId() {
  const {task} = useModel(Task, {
    loadByQueryParam: ({queryParams}) => queryParams.task_id,
    newIfNoId: {
      defaults: () => ({name: "Default task name"})
    }
  })

  return (
    <Layout>
      <View>
        <Text dataSet={{testid: "utils-use-model-new-if-no-id"}}>
          {task.readAttribute("name")}
        </Text>
      </View>
    </Layout>
  )
}
