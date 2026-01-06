import Checkbox from "@kaspernj/api-maker/build/utils/checkbox"
import Layout from "components/layout"
import React from "react"
import {View} from "react-native"

export default class RoutesUtilsCheckbox extends React.PureComponent {
  render() {
    return (
      <Layout>
        <View dataSet={{testid: "utils-checkbox-wrapper"}}>
          <Checkbox
            dataSet={{testid: "utils-checkbox-uncontrolled"}}
            defaultChecked={false}
            label="Uncontrolled checkbox"
          />
        </View>
      </Layout>
    )
  }
}
