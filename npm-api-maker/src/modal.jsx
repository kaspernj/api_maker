/* eslint-disable sort-imports */
import {Modal, Pressable, View} from "react-native"
import {shapeComponent} from "set-state-compare/build/shape-component.js"
import BaseComponent from "./base-component"
import React from "react"
import memo from "set-state-compare/build/memo.js"

export default memo(shapeComponent(class ApiMakerModal extends BaseComponent {
  render() {
    const {children, onRequestClose, ...restProps} = this.props

    return (
      <Modal onRequestClose={onRequestClose} {...restProps}>
        <View
          style={this.cache("rootViewStyle", {
            alignItems: "center",
            justifyContent: "center",
            minWidth: "100%",
            minHeight: "100%",
            padding: 20
          })}
        >
          <Pressable
            dataSet={this.cache("pressableDataSet", {class: "modal-backdrop"})}
            onPress={onRequestClose}
            style={this.cache("pressableStyle", {
              position: "absolute",
              minWidth: "100%",
              minHeight: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)"
            })}
          />
          {children}
        </View>
      </Modal>
    )
  }
}))
