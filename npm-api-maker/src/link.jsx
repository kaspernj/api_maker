import BaseComponent from "./base-component"
import {memo} from "react"
import {Platform, Pressable} from "react-native"
import {shapeComponent} from "set-state-compare/src/shape-component.js"

export default memo(shapeComponent(class Link extends BaseComponent {
  render() {
    const {to, onClick, onPress, ...restProps} = this.props

    if (Platform.OS == "web") {
      return (
        <a href={to} {...restProps} onClick={this.tt.onLinkClicked} />
      )
    }

    return (
      <Pressable onPress={this.tt.onPress} {...restProps} />
    )
  }

  onLinkClicked = (e, ...restArgs) => {
    const {onClick, onPress} = this.props

    if (onClick) {
      onClick(e, ...restArgs)
    }

    if (onPress) {
      onPress(e, ...restArgs)
    }

    if (!e.defaultPrevented && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()

      this.redirect()
    }
  }

  onPress() {
    const {onClick, onPress} = this.props

    if (onClick) {
      onClick(e, ...restArgs)
    }

    if (onPress) {
      onPress(e, ...restArgs)
    }

    this.redirect()
  }

  redirect() {
    const history = globalThis.apiMakerConfigGlobal?.history

    if (!history) throw new Error("History hasn't been set in the API maker configuration")

    history.push(this.props.to)
  }
}))
