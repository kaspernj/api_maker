/* eslint-disable react/jsx-no-literals */
// eslint-disable-next-line import/no-unresolved
import {Text, TextInput, View} from "react-native"
import React from "react"

const ProjectInput = ({defaultValue, inputProps, onChangeValue}) => (
  <View>
    <Text>
      Project
    </Text>
    <Text testID="super-admin-task-project-input-name">
      {inputProps.name}
    </Text>
    <TextInput
      dataSet={{id: inputProps.id, name: inputProps.name}}
      defaultValue={defaultValue}
      onChangeText={onChangeValue}
    />
  </View>
)

export default {
  edit: {
    attributes: [
      {attribute: "name"},
      {
        attribute: "state",
        // eslint-disable-next-line no-extra-parens
        content: ({defaultValue, inputProps, onChangeValue}) => (
          <View>
            <Text>
              State
            </Text>
            <TextInput
              dataSet={{id: inputProps.id}}
              defaultValue={defaultValue}
              onChangeText={onChangeValue}
            />
          </View>
        )
      },
      {
        attribute: "projectId",
        content: ({defaultValue, inputProps, onChangeValue}) => (
          <ProjectInput defaultValue={defaultValue} inputProps={inputProps} onChangeValue={onChangeValue} />
        )
      },
      {attribute: "userId"}
    ]
  }
}
