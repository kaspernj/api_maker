import {Text, View} from "react-native"
import Layout from "components/layout"
import React from "react"
import {Task} from "models.js"
import useModel from "@kaspernj/api-maker/src/use-model.js"

let defaultsCallCount = 0

export default function RoutesUtilsUseModelNewIfNoIdAsync() {
  const {task} = useModel(Task, {
    loadByQueryParam: ({queryParams}) => queryParams.task_id,
    newIfNoId: {
      defaults: () => {
        defaultsCallCount += 1

        return Promise.resolve({name: `Async default ${defaultsCallCount}`})
      }
    }
  })

  const taskName = task ? task.readAttribute("name") : "Loading"

  return (
    <Layout>
      <View>
        <Text dataSet={{testid: "utils-use-model-new-if-no-id-async"}}>
          {taskName}
        </Text>
      </View>
    </Layout>
  )
}
