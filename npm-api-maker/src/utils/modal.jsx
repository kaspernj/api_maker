/* eslint-disable implicit-arrow-linebreak, prefer-object-spread, sort-imports, sort-vars */
import React, {useMemo} from "react"
import {Modal, Pressable, View} from "react-native"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import {useBreakpoint} from "responsive-breakpoints"
import Card from "./card"
import Icon from "../utils/icon"
import memo from "set-state-compare/build/memo.js"

/** @typedef {Record<string, never>} Props */
/** @typedef {Record<string, never>} State */
export default memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class ApiMakerUtilsComponent extends ShapeComponent {
  render() {
    const {smDown} = useBreakpoint()
    const {children, dataSet, ...restProps} = this.props

    const actualDataSet = useMemo(() =>
      Object.assign(
        {component: "api-maker/utils/modal"},
        dataSet
      )
    , [dataSet])

    let width, maxWidth

    if (smDown) {
      width = "95%"
    } else {
      width = "80%"
      maxWidth = 800
    }

    const cardStyle = useMemo(() => ({width, maxWidth}), [width, maxWidth])

    return (
      <Modal dataSet={actualDataSet} {...restProps}>
        <View
          style={this.cache("rootViewStyle", {
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.8)"
          })}
        >
          <Card
            controls={this.cardHeaderControls()}
            style={cardStyle}
          >
            {children}
          </Card>
        </View>
      </Modal>
    )
  }

  cardHeaderControls() {
    return (
      <Pressable onPress={this.tt.onModalClosePress} style={this.cache("pressableStyle", {marginLeft: "auto", padding: 5})}>
        <Icon name="remove" />
      </Pressable>
    )
  }

  onModalClosePress = () => this.props.onRequestClose && this.props.onRequestClose()
}))
