import Layout from "components/layout"
import React from "react"
import {Text, View} from "react-native"
import useBreakpoint from "@kaspernj/api-maker/build/use-breakpoint"

export default function RoutesUtilsUseBreakpoint() {
  const {styling} = useBreakpoint()
  const upStyle = styling({
    base: {padding: 4},
    lgUp: {backgroundColor: "yellow"},
    mdUp: {backgroundColor: "green"},
    smUp: {backgroundColor: "blue"},
    xlUp: {backgroundColor: "orange"},
    xsUp: {backgroundColor: "purple"},
    xxlUp: {backgroundColor: "red"}
  })
  const downStyle = styling({
    base: {padding: 4},
    lgDown: {backgroundColor: "yellow"},
    mdDown: {backgroundColor: "green"},
    smDown: {backgroundColor: "blue"},
    xlDown: {backgroundColor: "orange"},
    xsDown: {backgroundColor: "purple"},
    xxlDown: {backgroundColor: "red"}
  })

  return (
    <Layout>
      <View
        dataSet={{appliedBackground: upStyle.backgroundColor, testid: "utils-use-breakpoint-up"}}
        style={upStyle}
      >
        <Text>
          {"Utils useBreakpoint up styling test"}
        </Text>
      </View>
      <View
        dataSet={{appliedBackgroundDown: downStyle.backgroundColor, testid: "utils-use-breakpoint-down"}}
        style={downStyle}
      >
        <Text>
          {"Utils useBreakpoint down styling test"}
        </Text>
      </View>
    </Layout>
  )
}
