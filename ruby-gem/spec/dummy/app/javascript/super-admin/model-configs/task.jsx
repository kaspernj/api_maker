/* eslint-disable react/jsx-no-literals */
// eslint-disable-next-line import/no-unresolved
import {Text, TextInput, View} from "react-native"
import React from "react"

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
      {attribute: "projectId"},
      {attribute: "userId"}
    ]
  }
}
