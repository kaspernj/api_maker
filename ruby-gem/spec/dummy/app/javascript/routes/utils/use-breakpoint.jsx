import Layout from "components/layout"
import React from "react"
import {Text, View} from "react-native"
import useBreakpoint from "@kaspernj/api-maker/build/use-breakpoint"

export default function RoutesUtilsUseBreakpoint() {
  const {styling} = useBreakpoint()
  const style = styling({
    base: {padding: 4},
    lgUp: {backgroundColor: "yellow"},
    mdUp: {backgroundColor: "green"},
    smUp: {backgroundColor: "blue"},
    xlUp: {backgroundColor: "orange"},
    xsUp: {backgroundColor: "purple"},
    xxlUp: {backgroundColor: "red"}
  })

  return (
    <Layout>
      <View dataSet={{appliedBackground: style.backgroundColor, testid: "utils-use-breakpoint"}} style={style}>
        <Text>
          Utils useBreakpoint styling test
        </Text>
      </View>
    </Layout>
  )
}
