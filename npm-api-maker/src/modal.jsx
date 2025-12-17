import BaseComponent from "./base-component.js"
import memo from "set-state-compare/build/memo.js"
import React from "react"
import {shapeComponent} from "set-state-compare/build/shape-component.js"
import {Modal, Pressable, View} from "react-native"

export default memo(shapeComponent(class ApiMakerModal extends BaseComponent {
  render() {
    const {children, onRequestClose, ...restProps} = this.props

    return (
      <Modal onRequestClose={onRequestClose} {...restProps}>
        <View
          style={this.rootViewStyle ||= {
            alignItems: "center",
            justifyContent: "center",
            minWidth: "100%",
            minHeight: "100%",
            padding: 20,
          }}
        >
          <Pressable
            dataSet={this.pressableDataSet ||= {class: "modal-backdrop"}}
            onPress={onRequestClose}
            style={this.pressableStyle ||= {
              position: "absolute",
              minWidth: "100%",
              minHeight: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)"
            }}
          />
          {children}
        </View>
      </Modal>
    )
  }
}))
